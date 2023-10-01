import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import Head from 'next/head';
import rehypePrettyCode from 'rehype-pretty-code';
import Date from '../../components/date';
import Layout from '../../components/layout';
import { getAllPostIds, getPostData } from '../../lib/posts';
import utilStyles from '../../styles/utils.module.css';
import RandomButton from '../../components/random_button';

export async function getStaticProps({ params }) {
  const postData = getPostData(params.id);

  const mdxSource = await serialize(postData.fileContents, {
    parseFrontmatter: true,
    mdxOptions: {
      rehypePlugins: [
        rehypePrettyCode,
      ],
    },
  });

  return { props: { mdxSource } };
}

export async function getStaticPaths() {
  const paths = getAllPostIds();

  return {
    paths,
    fallback: false,
  };
}

const components = {
  RandomButton
}

export default function Post({ mdxSource }) {
  return (
    <Layout>
      <Head>
        <title>{mdxSource.frontmatter.title}</title>
      </Head>

      <h1 className={utilStyles.headingXl}>{mdxSource.frontmatter.title}</h1>
      <div className={utilStyles.lightText}>
        <Date dateString={mdxSource.frontmatter.date} />
      </div>
      <div>
        <MDXRemote {...mdxSource} components={components}/>
      </div>
    </Layout>
  );
}
