---
title: "Myco Devlog I: Creating an Event Bus"
date: 2023-04-20
categories: devlog myco
excerpt_separator: <!--more-->
---

Event busses can simplify designs and allow for communication between classes that otherwise don't know about each other. Unfortunately, the event bus itself is not simple at all.

<!--more-->

### The Problem

For my graphics engine, Myco, I wanted to try and decouple the modules in the system from each other. In previous attempts, figuring out if the Window instance should be part of the Application or part of the Engine, for example, took up a lot of my time for what felt like a question that should be pretty innocuous. Getting the answer wrong, however, created a whole new headache whenever two systems that previously didn't need to communicate suddenly gained that new requirement for a feature I wanted to implement. Sometimes this was doable, and sometimes it would require a whole re-write to fix.

This is where an event bus comes in.

I am not the first person to think of using an event bus to handle inter-system communication. It's extremely common in commercial game engines. My reasons for wanting this are as follows:
  1. System decoupling--if communication is done over events then there's no longer a requirement to have a direct references to systems contained within other systems except for convenience where desired.
  2. Flexibility--as stated already, systems can easily interact with any other systems, which makes it simple to add interactions in the future.
  3. Challenge--there are a lot of *bad* ways to do this, and I thought it would be fun to try my best to *not* do it poorly.

### Pre-planning

I started out by looking for existing resources on how event busses might work. I largely found examples that used strings for both the event types as well as the payloads. I *really* didn't want to go down this route since strings are error-prone, and a small typo may take a long time to find. Using a string as the payload also removes type information--I wanted to send real structs.

Systems that use an enum for event types were also out. I wanted to allow the user to push events through the bus if desired, and needing all event types to be defined when the engine is compiled would not make that possible. I considered doing some kind of macro magic, and briefly experimented with code generation, but eventually decided against it.

After a lot of researching and playing around with different ideas, I decided on a subscribe/publish model, where systems subscribe to receive a certain type of event with a callback, and when one of those events is published, each subscribed system has its appropriate callback called with the published event. Now I just needed to figure out how to store all of it.

### Event Type Solution: Evil Template

I realized eventually that the obvious solution was to use the payloads themselves as the event types. For example, if you had a struct like this to represent a GLFW keypress event:

```cpp
struct GlfwKey {
  GLFWwindow *window;
  int key;
  int scancode;
  int action;
  int mods;
};
```

`GlfwKey` is really what I wanted as the key. Unfortunately, there's no way to do this directly--if I wanted `std::unordered_map< /* ??? */ , std::vector< /* ??? */ >>`, what would I put for the key type? I couldn't find any good way to automatically create a string from a typename (except macros), and I found plenty of articles explaining why `typeid` doesn't always work. From my understanding, it likely *would* work on *most* compilers, but there was no *guarantee*, and I just wasn't willing to take that chance unless I couldn't find a better way.

Luckily, I eventually found [this article](https://mikejsavage.co.uk/blog/cpp-tricks-type-id.html), which provides a method for getting a unique compile-time ID from any type. It is this very fun template:

```cpp
inline int type_id_seq = 0;
template<typename T> inline const int type_id = type_id_seq++;
```

It's very simple, and in my testing has worked quite well. On the linked article, it's mentioned that this would need some extra code to handle aliases and things correctly, but I'm okay just putting a disclaimer to not use those at this time, as I'm not sure exactly *how* you'd make it correctly detect those.

This method should theoretically be just as good as typeid, but not compiler dependent. Additionally, the values returned are sequential integers starting with 0, which means they can be used as vector indices. Therefore, no more `std::unordered_map`, which would have to do hashing anyway. We have arrived here:

```cpp
std::vector<std::vector< /* ??? */ >>
```

There was still the question of how to store callback functions that all take different arguments.

### Event Receivers and Payload Solution: Type Erasure

I've had the need to store types with a shared interface in a vector before, and the pattern is quite simple. Create an abstract base class, then create a templated class from that base class, and store instances of it as a pointer to the base class--type erasure 101. But the argument type caused a new problem, since somehow the base needed to be able to accommodate anything that might be passed to it.

`std::any` ended up being the solution I was looking for. The Receiver is very straightforward:

```cpp
template<typename T>
using Receiver = std::function<void(const T &)>;

class ReceiverI {
public:
  ReceiverI() = default;
  virtual ~ReceiverI() = default;

  virtual void call(const std::any &e) const = 0;
};

template<typename T>
class ReceiverWrap : public ReceiverI {
  const Receiver<T> receiver_;
public:
  ReceiverWrap() : receiver_([](const auto &){}) {}
  explicit ReceiverWrap(const Receiver<T> &&receiver)
      : receiver_(std::move(receiver)) {}

  ~ReceiverWrap() override = default;

  void call(const std::any &e) const override {
    receiver_(std::any_cast<T>(e));
  }
};
```

`Receiver`s themselves are just function objects that take some const ref to a payload. `ReceiverI` is the interface, and only consists of a single function that takes any argument. The `ReceiverWrap` does something useful with that `std::any` object, and converts to it its own template type. All together, it is used like so:

```cpp
struct Foo { int a; };

std::vector<std::unique_ptr<ReceiverI>> foo_receivers{};
foo_receivers.emplace_back(std::make_unique<ReceiverWrap<Foo>>([](const Foo &e) { /* ... */ }));
foo_receivers.emplace_back(std::make_unique<ReceiverWrap<Foo>>([](const Foo &e) { /* ... */ }));
```

We can store a vector of receiver objects without knowing the type--it is completely erased.
With that we have our completed method for storing a "map" of event types to a list of receivers for them:

```cpp
std::vector<std::vector<std::unique_ptr<ReceiverI>>>
```

It's long and ugly, and if it were needed in more than one place I'd typedef it, but it works.

### In Use

Event subscription is going to have to wait for a bit, as there's an as-of-yet undiscussed problem. The code for sending an event looks very simple, however:

```cpp
template<typename T, typename... Args>
static void send_nowait(Args &&... args) {
  if (type_id<T> < receivers_.size())
    for (const auto &r: receivers_[type_id<T>])
      r->call(std::any(T{std::forward<Args>(args)...}));
}
```

The if statement guards against sending events for which there are no receivers, which would mean we haven't entered it into the map yet, and would index into a place that doesn't exist. Other than that it's as simple as iterating the receivers for a specific type_id, and sending a payload using the given type and parameters to each call function.

### A New Problem

As mentioned, event subscription is not as simple. Right now, it would be easy enough to write something like this:

```cpp
template<typename T>
static void sub(const Receiver<T> &&recv) {
  while (type_id<T> >= receivers_.size())
    receivers_.emplace_back();

  receivers_[type_id<T>].emplace_back(
      std::make_unique<ReceiverWrap<T>>(std::forward<const Receiver<T>>(recv))
  );
}
```

And this would work as expected. The while loop is necessary since the IDs are generated at compile time, but there's no guarantee on what order the type_ids will be used. We have to make sure to create enough space in the vector index wherever is necessary.

Just inserting the receivers at the end of the list as they are subscribed causes a problem, however. We have no information about what each receiver belongs to, and we have no control over what order the receivers are called. As an example, imagine we set up a Render event that is propagated to most systems. The Application will call the user code, then the Batcher will set up the batches and draw them, and finally the Window flips to show the new frame. 

You could break these up as separate events, but they are all related, and I think they make sense as being the same one. With our current solution, there is no way to guarantee this order of events occurs without very carefully cementing the order the systems are added. This will give us unexpected results at best, or crash the program at worst if some module needs to set up state for another. This would also be a nightmare to handle if other events with the same modules needed to happen in some other order, so there's no clear way to subscribe them that's not from a centralized location. (coupling, bad!)

This article is long enough, but a solution to this was devised which is a story of optimization beyond any reasonable degree. Stay tuned!
