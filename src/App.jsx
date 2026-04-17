import React, { useMemo, useState } from "react";
import algorithms from "./data/algorithms.json";

const recentPosts = [];
const projectPosts = [];

const sections = [
  { key: "recent", label: "Recent Posts" },
  { key: "algorithm", label: "Algorithm" },
  { key: "projects", label: "Projects" },
];

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

function EmptyState() {
  return (
    <div className="border-t border-neutral-200 py-10">
      <p className="text-sm text-neutral-500">아직 게시물이 없습니다.</p>
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

function AlgorithmList({ items }) {
  if (!items.length) return <EmptyState />;

  return (
    <div className="divide-y divide-neutral-200 border-t border-neutral-200">
      {items.map((item) => (
        <article
          key={item.uid}
          className="grid gap-3 py-6 md:grid-cols-[110px_1fr_120px_90px_120px]"
        >
          <div className="text-sm text-neutral-400">
            {item.platform}
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-semibold tracking-tight text-neutral-900">
              {item.problemId ? `${item.problemId}. ${item.title}` : item.title}
            </h3>
            <p className="text-sm text-neutral-500">
              {item.language}
            </p>
          </div>

          <div className="text-sm text-neutral-500">
            {item.group}
          </div>

          <div className="text-sm text-neutral-500">
            {item.performance?.time || "-"}
          </div>

          <div className="text-sm text-neutral-400">
            {item.committedAt
              ? new Date(item.committedAt).toLocaleDateString("ko-KR")
              : "-"}
          </div>
        </article>
      ))}
    </div>
  );
}

export default function BlogHomeMockup() {
  const [activeSection, setActiveSection] = useState("recent");

  const currentTitle = useMemo(() => {
    if (activeSection === "algorithm") return "Algorithm";
    if (activeSection === "projects") return "Projects";
    return "Recent Posts";
  }, [activeSection]);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-neutral-200 bg-neutral-50 p-8">
          <div className="space-y-4">
            <div className="text-2xl font-semibold tracking-tight">
              hanseulchung
            </div>
            <p className="text-sm leading-7 text-neutral-500">
              블로그
            </p>
          </div>
        </aside>

        <main className="p-8 sm:p-10">
          <header className="border-b border-neutral-200 pb-5">
            <div className="flex flex-wrap items-center gap-5">
              {sections.map((section) => (
                <NavButton
                  key={section.key}
                  active={activeSection === section.key}
                  onClick={() => setActiveSection(section.key)}
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
              <AlgorithmList items={algorithms} />
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
