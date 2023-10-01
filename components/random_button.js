import { useState, useEffect } from "react";

export default function RandomButton() {
  const [v, setV] = useState(0);
  const changeV = () => setV(Math.floor(Math.random() * 100));

  useEffect(() => {
    changeV();
  }, []);

  return <button onClick={changeV}>{v}</button>;
}
