import React, { useMemo, useState } from "react";
import algorithms from "./data/algorithms.json";

const recentPosts = [];
const projectPosts = [];

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ko-KR");
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

function AlgorithmList({ items, selectedUid, onSelect }) {
  if (!items.length) return <EmptyState text="아직 알고리즘 데이터가 없습니다." />;

  return (
    <div className="divide-y divide-neutral-200 border-t border-neutral-200">
      {items.map((item) => {
        const selected = item.uid === selectedUid;

        return (
          <button
            key={item.uid}
            onClick={() => onSelect(item)}
            className={`grid w-full gap-3 py-6 text-left transition md:grid-cols-[90px_1fr_90px_90px_120px] ${
              selected ? "bg-neutral-50" : "hover:bg-neutral-50"
            }`}
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
            <div className="text-sm text-neutral-400">{formatDate(item.committedAt)}</div>
          </button>
        );
      })}
    </div>
  );
}

function AlgorithmDetail({ item }) {
  if (!item) {
    return (
      <div className="rounded-3xl border border-neutral-200 p-6">
        <p className="text-sm text-neutral-500">문제를 선택하면 상세 정보가 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-3xl border border-neutral-200 p-6">
      <div className="space-y-2">
        <div className="text-sm text-neutral-400">{item.platform}</div>
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
          {item.problemId ? `${item.problemId}. ${item.title}` : item.title}
        </h2>
        <div className="flex flex-wrap gap-3 text-sm text-neutral-500">
          <span>{item.group}</span>
          <span>{item.language}</span>
          <span>{item.performance?.time || "-"}</span>
          <span>{item.performance?.memory || "-"}</span>
          <span>{formatDate(item.committedAt)}</span>
        </div>
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="inline-block pt-1 text-sm text-neutral-900 underline underline-offset-4"
          >
            문제 링크 보기
          </a>
        )}
      </div>

      {item.samples?.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold tracking-tight text-neutral-900">Samples</h3>
          {item.samples.map((sample, index) => (
            <div key={index} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm text-neutral-400">Input {index + 1}</div>
                <pre className="overflow-x-auto rounded-2xl bg-neutral-100 p-4 text-sm leading-6 text-neutral-800">
{sample.input || ""}
                </pre>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-neutral-400">Output {index + 1}</div>
                <pre className="overflow-x-auto rounded-2xl bg-neutral-100 p-4 text-sm leading-6 text-neutral-800">
{sample.output || ""}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}

      {item.code?.content && (
        <div className="space-y-2">
          <div className="text-sm text-neutral-400">{item.code.filename}</div>
          <pre className="overflow-x-auto rounded-2xl bg-neutral-950 p-4 text-xs leading-6 text-neutral-100">
{item.code.content}
          </pre>
        </div>
      )}

      {item.memo && (
        <div className="space-y-2">
          <div className="text-sm text-neutral-400">Memo</div>
          <div className="rounded-2xl bg-neutral-100 p-4 text-sm leading-7 text-neutral-700">
            {item.memo}
          </div>
        </div>
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

  const [activeSection, setActiveSection] = useState(
    sections[0]?.key || "algorithm"
  );
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(algorithms[0] || null);

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
              <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
                <AlgorithmList
                  items={algorithms}
                  selectedUid={selectedAlgorithm?.uid}
                  onSelect={setSelectedAlgorithm}
                />
                <AlgorithmDetail item={selectedAlgorithm} />
              </div>
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
