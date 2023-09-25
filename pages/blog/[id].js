import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import Head from 'next/head';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeCodeTitles from 'rehype-code-titles';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import Date from '../../components/date';
import Layout from '../../components/layout';
import { getAllPostIds, getPostData } from '../../lib/posts';
import utilStyles from '../../styles/utils.module.css';
import rehypePrettyCode from 'rehype-pretty-code';

export async function getStaticProps({ params }) {
  const postData = getPostData(params.id);

  const mdxSource = await serialize(postData.content, {
    mdxOptions: {
      rehypePlugins: [
        rehypePrettyCode,
      ],
    },
  });

  return {
    props: {
      source: mdxSource,
      postData,
    },
  };
}

export async function getStaticPaths() {
  const paths = getAllPostIds();

  return {
    paths,
    fallback: false,
  };
}

const components = {
  h1: utilStyles.headingXl,
  h2: utilStyles.headingLg
}

export default function Post({ source, postData }) {
  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>
      </Head>

      <h1 className={utilStyles.headingXl}>{postData.title}</h1>
      <div className={utilStyles.lightText}>
        <Date dateString={postData.date} />
      </div>
      <MDXRemote {...source} />
    </Layout>
  );
}
