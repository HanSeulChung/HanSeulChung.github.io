import React, { useMemo, useState } from "react";
import algorithms from "./data/algorithms.json";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

const recentPosts = [];
const projectPosts = [];

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ko-KR");
}

function getDisplayDate(item) {
  return item.submittedAt || item.committedAt || null;
}

function NavButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`pb-1 text-sm transition ${
        active
          ? "border-b border-neutral-900 text-neutral-900"
          : "text-neutral-500 hover:text-neutral-900"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ text = "아직 게시물이 없습니다." }) {
  return (
    <div className="border-t border-neutral-200 py-10">
      <p className="text-sm text-neutral-500">{text}</p>
    </div>
  );
}

function DefaultPostList({ items }) {
  if (!items.length) return <EmptyState />;

  return (
    <div className="divide-y divide-neutral-200 border-t border-neutral-200">
      {items.map((post) => (
        <article
          key={`${post.date}-${post.title}`}
          className="grid gap-3 py-6 md:grid-cols-[120px_1fr] md:gap-8"
        >
          <div className="text-sm text-neutral-400">{post.date}</div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold tracking-tight text-neutral-900">
              {post.title}
            </h3>
            <p className="max-w-2xl text-sm leading-7 text-neutral-600">
              {post.summary}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

function AlgorithmList({ items, onSelect }) {
  if (!items.length) return <EmptyState text="아직 알고리즘 데이터가 없습니다." />;

  return (
    <div className="divide-y divide-neutral-200 border-t border-neutral-200">
      {items.map((item) => (
        <button
          key={item.uid}
          onClick={() => onSelect(item)}
          className="grid w-full gap-3 py-6 text-left transition hover:bg-neutral-50 md:grid-cols-[90px_1fr_100px_90px_120px]"
        >
          <div className="text-sm text-neutral-400">{item.platform}</div>

          <div className="space-y-1">
            <h3 className="text-xl font-semibold tracking-tight text-neutral-900">
              {item.problemId ? `${item.problemId}. ${item.title}` : item.title}
            </h3>
            <p className="text-sm text-neutral-500">{item.language}</p>
          </div>

          <div className="text-sm text-neutral-500">{item.group}</div>
          <div className="text-sm text-neutral-500">{item.performance?.time || "-"}</div>
          <div className="text-sm text-neutral-400">{formatDate(getDisplayDate(item))}</div>
        </button>
      ))}
    </div>
  );
}

function SampleBlock({ title, value }) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-neutral-400">{title}</div>
      <pre className="overflow-x-auto rounded-2xl bg-neutral-100 p-4 text-sm leading-6 text-neutral-800">
{value || ""}
      </pre>
    </div>
  );
}

function ReadmeRenderer({ text }) {
  if (!text) {
    return <p className="text-sm text-neutral-500">문제 설명이 없습니다.</p>;
  }

  return (
    <div className="max-w-none text-neutral-800">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1({ children }) {
            return (
              <h1 className="mt-8 mb-4 text-3xl font-bold tracking-tight text-neutral-900 first:mt-0">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="mt-8 mb-4 text-2xl font-bold tracking-tight text-neutral-900">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="mt-6 mb-3 text-xl font-semibold tracking-tight text-neutral-900">
                {children}
              </h3>
            );
          },
          h4({ children }) {
            return (
              <h4 className="mt-5 mb-3 text-lg font-semibold text-neutral-900">
                {children}
              </h4>
            );
          },
          p({ children }) {
            return (
              <p className="mb-4 text-sm leading-8 text-neutral-700">
                {children}
              </p>
            );
          },
          strong({ children }) {
            return (
              <strong className="font-semibold text-neutral-900">
                {children}
              </strong>
            );
          },
          ul({ children }) {
            return (
              <ul className="mb-4 list-disc space-y-2 pl-6 text-sm leading-8 text-neutral-700">
                {children}
              </ul>
            );
          },
          ol({ children }) {
            return (
              <ol className="mb-4 list-decimal space-y-2 pl-6 text-sm leading-8 text-neutral-700">
                {children}
              </ol>
            );
          },
          li({ children }) {
            return <li>{children}</li>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="mb-4 border-l-4 border-neutral-300 pl-4 text-sm leading-8 text-neutral-600">
                {children}
              </blockquote>
            );
          },
          hr() {
            return <hr className="my-8 border-neutral-200" />;
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-neutral-900 underline underline-offset-4"
              >
                {children}
              </a>
            );
          },
          img({ src, alt }) {
            return (
              <img
                src={src}
                alt={alt || ""}
                className="my-4 max-w-full rounded-2xl border border-neutral-200"
              />
            );
          },
          table({ children }) {
            return (
              <div className="my-4 overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-neutral-50">{children}</thead>;
          },
          th({ children }) {
            return (
              <th className="border border-neutral-200 px-3 py-2 text-left font-semibold text-neutral-900">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="border border-neutral-200 px-3 py-2 align-top text-neutral-700">
                {children}
              </td>
            );
          },
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match?.[1];

            if (inline) {
              return (
                <code
                  className="rounded bg-neutral-100 px-1.5 py-0.5 text-[0.9em]"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <div className="my-4 overflow-hidden rounded-2xl border border-neutral-200">
                <SyntaxHighlighter
                  language={language || "text"}
                  style={oneLight}
                  customStyle={{
                    margin: 0,
                    padding: "1rem",
                    fontSize: "0.875rem",
                    lineHeight: 1.8,
                    background: "#fafafa",
                  }}
                  wrapLongLines
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

function AlgorithmDetailPage({ item, onBack }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <button
          onClick={onBack}
          className="text-sm text-neutral-500 transition hover:text-neutral-900"
        >
          ← 목록으로
        </button>
      </div>

      <section className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm text-neutral-400">{item.platform}</div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            {item.problemId ? `${item.problemId}. ${item.title}` : item.title}
          </h1>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-neutral-500">
          <span>{item.group}</span>
          <span>{item.language}</span>
          <span>{item.performance?.time || "-"}</span>
          <span>{item.performance?.memory || "-"}</span>
          <span>{formatDate(getDisplayDate(item))}</span>
        </div>

        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-sm text-neutral-900 underline underline-offset-4"
          >
            문제 링크 보기
          </a>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">문제 설명</h2>
        <div className="rounded-3xl border border-neutral-200 bg-white p-6">
          <ReadmeRenderer text={item.readme} />
        </div>
      </section>

      {item.samples?.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">예제 입출력</h2>
          <div className="space-y-5">
            {item.samples.map((sample, index) => (
              <div key={index} className="grid gap-4 md:grid-cols-2">
                <SampleBlock title={`Input ${index + 1}`} value={sample.input} />
                <SampleBlock title={`Output ${index + 1}`} value={sample.output} />
              </div>
            ))}
          </div>
        </section>
      )}

      {item.code?.content && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">내 코드</h2>
            <div className="text-sm text-neutral-400">{item.code.filename}</div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-neutral-200">
            <SyntaxHighlighter
              language={(item.code.language || "").toLowerCase() === "java" ? "java" : "text"}
              style={oneLight}
              customStyle={{
                margin: 0,
                padding: "1.25rem",
                fontSize: "0.875rem",
                lineHeight: 1.8,
                background: "#fafafa",
              }}
              showLineNumbers
              wrapLongLines
            >
              {item.code.content}
            </SyntaxHighlighter>
          </div>
        </section>
      )}

      {item.memo && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">Memo</h2>
          <div className="whitespace-pre-wrap rounded-3xl border border-neutral-200 bg-neutral-50 p-6 text-sm leading-7 text-neutral-700">
            {item.memo}
          </div>
        </section>
      )}
    </div>
  );
}

export default function BlogHomeMockup() {
  const sections = useMemo(() => {
    const result = [];
    if (recentPosts.length) result.push({ key: "recent", label: "Recent Posts" });
    result.push({ key: "algorithm", label: "Algorithm" });
    if (projectPosts.length) result.push({ key: "projects", label: "Projects" });
    return result;
  }, []);

  const [activeSection, setActiveSection] = useState(sections[0]?.key || "algorithm");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);

  const currentTitle = useMemo(() => {
    if (activeSection === "algorithm") return selectedAlgorithm ? "Algorithm Detail" : "Algorithm";
    if (activeSection === "projects") return "Projects";
    return "Recent Posts";
  }, [activeSection, selectedAlgorithm]);

  const handleSelectSection = (sectionKey) => {
    setActiveSection(sectionKey);
    if (sectionKey !== "algorithm") {
      setSelectedAlgorithm(null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-neutral-200 bg-neutral-50 p-8">
          <div className="space-y-4">
            <div className="text-2xl font-semibold tracking-tight">hanseulchung</div>
            <p className="text-sm leading-7 text-neutral-500">블로그</p>
          </div>
        </aside>

        <main className="p-8 sm:p-10">
          <header className="border-b border-neutral-200 pb-5">
            <div className="flex flex-wrap items-center gap-5">
              {sections.map((section) => (
                <NavButton
                  key={section.key}
                  active={activeSection === section.key}
                  onClick={() => handleSelectSection(section.key)}
                >
                  {section.label}
                </NavButton>
              ))}
            </div>
          </header>

          <section className="pt-10">
            <div className="pb-8">
              <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
                {currentTitle}
              </h1>
            </div>

            {activeSection === "algorithm" ? (
              selectedAlgorithm ? (
                <AlgorithmDetailPage
                  item={selectedAlgorithm}
                  onBack={() => setSelectedAlgorithm(null)}
                />
              ) : (
                <AlgorithmList items={algorithms} onSelect={setSelectedAlgorithm} />
              )
            ) : activeSection === "projects" ? (
              <DefaultPostList items={projectPosts} />
            ) : (
              <DefaultPostList items={recentPosts} />
            )}
          </section>
        </main>
      </div>
    </div>
  );
} 
