"use client";

import { useState, useCallback } from "react";

const TABS = [
  { key: "color-palette", label: "Color" },
  { key: "typography", label: "Typography" },
  { key: "radius", label: "Radius" },
  { key: "used-case", label: "Used Case" },
  { key: "grid", label: "Grid" },
  { key: "mobile-pc", label: "Screen" },
  { key: "card", label: "Card" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/* -- Sanitize helper -- */
function sanitize(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/* -- Copy helper -- */
function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = useCallback((text: string) => {
    const safe = sanitize(text);
    if (!navigator?.clipboard?.writeText) return;
    navigator.clipboard.writeText(safe).then(() => {
      setCopied(safe);
      setTimeout(() => setCopied(null), 1500);
    }).catch(() => {
      /* clipboard access denied — silently fail */
    });
  }, []);
  return { copied, copy };
}

/* -- Class name validator -- */
const SAFE_CLASS_RE = /^[a-zA-Z0-9\s\-_/[\].:()#%]+$/;
function safeClassName(cls: string): string {
  return SAFE_CLASS_RE.test(cls) ? cls : "";
}

/* -- Swatch card -- */
function Swatch({
  color,
  name,
  token,
  hex,
  light = false,
  className = "",
}: {
  color: string;
  name: string;
  token: string;
  hex: string;
  light?: boolean;
  className?: string;
}) {
  const { copied, copy } = useCopy();
  const safeColor = safeClassName(color);
  const safeExtra = safeClassName(className);
  return (
    <div
      onClick={() => copy(hex)}
      className={`group relative cursor-pointer rounded-xl overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg ${safeExtra}`}
    >
      <div className={`${safeColor} h-[96px] flex items-end p-[16px]`}>
        <span
          className={`text-[13px] font-semibold ${light ? "text-white" : "text-grey-800"}`}
        >
          {name}
        </span>
        <div
          className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity ${copied === hex ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        >
          <span className="text-[13px] text-white font-medium">
            {copied === hex ? "Copied!" : "Click to copy"}
          </span>
        </div>
      </div>
      <div className="bg-white border border-t-0 border-grey-200 rounded-b-xl px-[16px] py-[12px]">
        <p className="text-[11px] text-grey-500 font-mono leading-[1.6]">
          {token}
        </p>
        <p className="text-[12px] text-grey-800 font-mono font-medium">
          {hex}
        </p>
      </div>
    </div>
  );
}

/* -- Tab Sidebar (reusable) -- */
function TabSidebar({
  title,
  items,
}: {
  title: string;
  items: { label: string; id: string }[];
}) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  return (
    <aside className="w-[220px] shrink-0 border-r border-grey-200 bg-white sticky top-[64px] h-[calc(100vh-64px)] py-[32px] px-[24px]">
      <p className="text-[11px] text-grey-400 font-semibold uppercase tracking-[0.08em] mb-[16px]">
        {title}
      </p>
      <nav className="flex flex-col gap-[2px]">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={() => setActive(item.id)}
            className={`px-[12px] py-[8px] rounded-lg text-[14px] cursor-pointer transition-colors ${active === item.id ? "bg-grey-100 text-grey-950 font-semibold" : "text-grey-500 hover:bg-grey-50 hover:text-grey-700"}`}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}

/* -- Section heading -- */
function SectionHeading({
  title,
  desc,
  id,
}: {
  title: string;
  desc?: string;
  id?: string;
}) {
  return (
    <div id={id} className="mb-[40px] scroll-mt-[80px]">
      <h3 className="text-[24px] font-semibold text-grey-950 tracking-[-0.02em] leading-[1.4]">
        {title}
      </h3>
      {desc && (
        <p className="text-[15px] text-grey-500 mt-[8px] leading-[1.7] max-w-[640px]">
          {desc}
        </p>
      )}
      <div className="w-full h-[1px] bg-grey-200 mt-[20px]" />
    </div>
  );
}

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("color-palette");

  return (
    <div className="min-h-screen bg-grey-50">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-grey-200">
        <div className="max-w-[1440px] mx-auto px-[40px] flex items-center h-[64px]">
          <span className="text-[18px] font-semibold text-primary-main tracking-[-0.02em]">
            Pick &amp; Save
          </span>
          <span className="text-[14px] text-grey-400 ml-[12px] font-medium">
            Design System
          </span>
          <nav className="ml-auto flex">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-[20px] h-[64px] text-[14px] font-medium transition-colors ${
                  activeTab === tab.key
                    ? "text-grey-950"
                    : "text-grey-400 hover:text-grey-600"
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-[20px] right-[20px] h-[2px] bg-grey-950 rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Tab Content */}
      <main className="max-w-[1440px] mx-auto">
        {activeTab === "color-palette" && <ColorPaletteTab />}
        {activeTab === "typography" && <TypographyTab />}
        {activeTab === "radius" && <RadiusTab />}
        {activeTab === "used-case" && <UsedCaseTab />}
        {activeTab === "grid" && <GridTab />}
        {activeTab === "mobile-pc" && <MobilePcTab />}
        {activeTab === "card" && <CardTab />}
      </main>
    </div>
  );
}

/* ============================================================
   Color Palette
   ============================================================ */
function ColorPaletteTab() {
  const NAV = [
    { id: "brand", label: "Brand" },
    { id: "primary", label: "Primary" },
    { id: "secondary", label: "Secondary" },
    { id: "neutral", label: "Neutral" },
    { id: "semantic", label: "Semantic" },
  ];
  const [activeSection, setActiveSection] = useState("brand");

  return (
    <div className="flex">
      {/* Sidebar Nav */}
      <aside className="w-[220px] shrink-0 border-r border-grey-200 bg-white sticky top-[64px] h-[calc(100vh-64px)] py-[32px] px-[24px]">
        <p className="text-[11px] text-grey-400 font-semibold uppercase tracking-[0.08em] mb-[16px]">
          Color
        </p>
        <nav className="flex flex-col gap-[2px]">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setActiveSection(item.id)}
              className={`px-[12px] py-[8px] rounded-lg text-[14px] transition-colors ${
                activeSection === item.id
                  ? "bg-grey-100 text-grey-950 font-semibold"
                  : "text-grey-500 hover:bg-grey-50 hover:text-grey-700"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <section className="flex-1 px-[60px] py-[48px] min-h-screen">
        {/* Page Title */}
        <div className="mb-[60px]">
          <h2 className="text-[32px] font-semibold text-grey-950 tracking-[-0.02em] leading-[1.3]">
            Color
          </h2>
          <p className="text-[15px] text-grey-500 mt-[12px] leading-[1.7] max-w-[640px]">
            Pick &amp; Save의 색상 시스템입니다. 브랜드 아이덴티티를 전달하고
            일관된 사용자 경험을 제공하기 위해 정의된 컬러 팔레트입니다.
          </p>
        </div>

        {/* ---- Brand ---- */}
        <SectionHeading
          id="brand"
          title="Brand Color"
          desc="Pick & Save의 메인컬러는 P&S Gradient를 사용합니다. 브랜드 아이덴티티를 전달할 때 반드시 활용할 것을 권장합니다."
        />
        <div
          className="h-[200px] rounded-2xl overflow-hidden flex items-end p-[24px] mb-[24px]"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary-main) 0%, var(--color-secondary-main) 100%)",
          }}
        >
          <div>
            <span className="text-[20px] font-semibold text-white">
              Pick &amp; Save Gradient
            </span>
            <p className="text-[13px] text-white/60 mt-[4px]">
              Primary → Secondary
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-[16px] mb-[64px]">
          <Swatch
            color="bg-primary-main"
            name="Primary"
            token="--color-primary"
            hex="#0F176C"
            light
          />
          <Swatch
            color="bg-secondary-main"
            name="Secondary"
            token="--color-secondary"
            hex="#F0759C"
            light
          />
          <Swatch
            color="bg-white border border-grey-200"
            name="White"
            token="--color-white"
            hex="#FFFFFF"
          />
        </div>

        {/* ---- Primary ---- */}
        <SectionHeading
          id="primary"
          title="Primary"
          desc="브랜드 경험에 직접적인 영향을 주는 버튼, 활성 상태 및 UI 전체의 주요 구성 요소에 사용합니다."
        />
        <div className="grid grid-cols-4 gap-[16px] mb-[64px]">
          <Swatch
            color="bg-primary-main"
            name="100%"
            token="--color-primary"
            hex="#0F176C"
            light
          />
          <Swatch
            color="bg-primary-light"
            name="50%"
            token="--color-primary-50"
            hex="#0F176C80"
            light
          />
          <Swatch
            color="bg-primary-lighter"
            name="30%"
            token="--color-primary-30"
            hex="#0F176C4D"
          />
          <Swatch
            color="bg-primary-simpleLighter"
            name="10%"
            token="--color-primary-10"
            hex="#0F176C1A"
          />
        </div>

        {/* ---- Secondary ---- */}
        <SectionHeading
          id="secondary"
          title="Secondary"
          desc="UI 요소들의 기능 또는 정보 유형에 따라 의미를 강조하여 전달하는 목적으로 보조적으로 사용합니다."
        />
        <div className="grid grid-cols-4 gap-[16px] mb-[64px]">
          <Swatch
            color="bg-secondary-main"
            name="100%"
            token="--color-secondary"
            hex="#F0759C"
            light
          />
          <Swatch
            color="bg-secondary-light"
            name="50%"
            token="--color-secondary-50"
            hex="#F0759C80"
            light
          />
          <Swatch
            color="bg-secondary-lighter"
            name="30%"
            token="--color-secondary-30"
            hex="#F0759C4D"
          />
          <Swatch
            color="bg-secondary-simpleLighter"
            name="10%"
            token="--color-secondary-10"
            hex="#F0759C1A"
          />
        </div>

        {/* ---- Neutral ---- */}
        <SectionHeading
          id="neutral"
          title="Neutral"
          desc="텍스트, 배경, 보더 등 UI 전반에 사용되는 그레이 스케일입니다."
        />
        <div className="grid grid-cols-4 gap-[16px] mb-[24px]">
          {[
            { name: "950", color: "bg-grey-950", token: "--color-gray-950", hex: "#0F0F10", light: true },
            { name: "900", color: "bg-grey-900", token: "--color-gray-900", hex: "#171719", light: true },
            { name: "800", color: "bg-grey-800", token: "--color-gray-800", hex: "#292A2D", light: true },
            { name: "700", color: "bg-grey-700", token: "--color-gray-700", hex: "#46474C", light: true },
            { name: "600", color: "bg-grey-600", token: "--color-gray-600", hex: "#5A5C63", light: true },
            { name: "500", color: "bg-grey-500", token: "--color-gray-500", hex: "#878992", light: true },
            { name: "400", color: "bg-grey-400", token: "--color-gray-400", hex: "#AEB0B6", light: false },
            { name: "300", color: "bg-grey-300", token: "--color-gray-300", hex: "#DBDCDF", light: false },
            { name: "200", color: "bg-grey-200", token: "--color-gray-200", hex: "#EAEBEC", light: false },
            { name: "100", color: "bg-grey-100", token: "--color-gray-100", hex: "#F4F4F5", light: false },
            { name: "50", color: "bg-grey-50", token: "--color-gray-50", hex: "#F7F8F9", light: false },
            { name: "White", color: "bg-white border border-grey-200", token: "--color-white", hex: "#FFFFFF", light: false },
          ].map((c) => (
            <Swatch
              key={c.name}
              color={c.color}
              name={`Gray ${c.name}`}
              token={c.token}
              hex={c.hex}
              light={c.light}
            />
          ))}
        </div>
        {/* Neutral strip */}
        <div className="flex rounded-xl overflow-hidden h-[48px] mb-[64px]">
          {[
            "bg-grey-950",
            "bg-grey-900",
            "bg-grey-800",
            "bg-grey-700",
            "bg-grey-600",
            "bg-grey-500",
            "bg-grey-400",
            "bg-grey-300",
            "bg-grey-200",
            "bg-grey-100",
            "bg-grey-50",
            "bg-white border-y border-r border-grey-200",
          ].map((bg, i) => (
            <div
              key={i}
              className={`flex-1 ${bg} ${i === 0 ? "rounded-l-xl" : ""} ${i === 11 ? "rounded-r-xl" : ""}`}
            />
          ))}
        </div>

        {/* ---- Semantic ---- */}
        <SectionHeading
          id="semantic"
          title="Semantic"
          desc="상태와 피드백을 전달하기 위한 시멘틱 컬러입니다."
        />
        <div className="grid grid-cols-4 gap-[16px] mb-[24px]">
          <Swatch
            color="bg-red-700"
            name="Red 700"
            token="--color-red-700"
            hex="#971818"
            light
          />
          <Swatch
            color="bg-red-500"
            name="Red 500"
            token="--color-red-500"
            hex="#E42727"
            light
          />
          <Swatch
            color="bg-red-50"
            name="Red 50%"
            token="--color-red-50"
            hex="#E4272780"
            light
          />
          <Swatch
            color="bg-red-10"
            name="Red 10%"
            token="--color-red-10"
            hex="#E427271A"
          />
        </div>
        <div className="grid grid-cols-4 gap-[16px] mb-[40px]">
          <Swatch
            color="bg-green-500"
            name="Green 500"
            token="--color-green-500"
            hex="#23B44F"
            light
          />
        </div>

        {/* Role mapping table */}
        <div className="bg-white border border-grey-200 rounded-xl overflow-hidden mb-[64px]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-grey-200">
                <th className="text-left text-[12px] text-grey-400 font-medium px-[20px] py-[14px] uppercase tracking-[0.05em]">
                  Role
                </th>
                <th className="text-left text-[12px] text-grey-400 font-medium px-[20px] py-[14px] uppercase tracking-[0.05em]">
                  Color
                </th>
                <th className="text-left text-[12px] text-grey-400 font-medium px-[20px] py-[14px] uppercase tracking-[0.05em]">
                  Token
                </th>
                <th className="text-left text-[12px] text-grey-400 font-medium px-[20px] py-[14px] uppercase tracking-[0.05em]">
                  Usage
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { role: "Warning", swatch: "bg-red-500", token: "--color-red-500", usage: "오류, 삭제, 위험 상태 표시" },
                { role: "Success", swatch: "bg-green-500", token: "--color-green-500", usage: "성공, 완료, 활성 상태 표시" },
                { role: "Information", swatch: "bg-primary-simpleLighter", token: "--color-primary-10", usage: "안내, 정보 표시" },
                { role: "Disabled", swatch: "bg-grey-400", token: "--color-gray-400", usage: "비활성 상태, 진행 전" },
              ].map((row) => (
                <tr
                  key={row.role}
                  className="border-b border-grey-100 last:border-b-0"
                >
                  <td className="px-[20px] py-[16px] text-[14px] text-grey-800 font-medium">
                    {row.role}
                  </td>
                  <td className="px-[20px] py-[16px]">
                    <div
                      className={`w-[32px] h-[32px] rounded-lg ${row.swatch}`}
                    />
                  </td>
                  <td className="px-[20px] py-[16px] text-[13px] text-grey-500 font-mono">
                    {row.token}
                  </td>
                  <td className="px-[20px] py-[16px] text-[13px] text-grey-500">
                    {row.usage}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   Typography
   ============================================================ */
function TypographyTab() {
  return (
    <div className="flex">
      <aside className="w-[220px] shrink-0 border-r border-grey-200 bg-white sticky top-[64px] h-[calc(100vh-64px)] py-[32px] px-[24px]">
        <p className="text-[11px] text-grey-400 font-semibold uppercase tracking-[0.08em] mb-[16px]">
          Typography
        </p>
        <nav className="flex flex-col gap-[2px]">
          {["Font Family", "Guidelines", "Type Scale"].map((item, i) => (
            <a
              key={item}
              href={`#typo-${i}`}
              className={`px-[12px] py-[8px] rounded-lg text-[14px] transition-colors ${i === 0 ? "bg-grey-100 text-grey-950 font-semibold" : "text-grey-500 hover:bg-grey-50 hover:text-grey-700"}`}
            >
              {item}
            </a>
          ))}
        </nav>
      </aside>
      <section className="flex-1 px-[60px] py-[48px] min-h-screen">
        <div className="mb-[60px]">
          <h2 className="text-[32px] font-semibold text-grey-950 tracking-[-0.02em] leading-[1.3]">
            Typography
          </h2>
          <p className="text-[15px] text-grey-500 mt-[12px] leading-[1.7] max-w-[640px]">
            서비스 전반에 사용되는 서체와 텍스트 스타일을 정의합니다.
          </p>
        </div>

        <SectionHeading
          id="typo-0"
          title="Font Family"
          desc="Pretendard를 기본 서체로 사용합니다."
        />
        <div className="bg-white border border-grey-200 rounded-2xl overflow-hidden mb-[64px]">
          <div className="flex items-center justify-between px-[40px] py-[32px] border-b border-grey-100">
            <span className="text-[48px] font-medium text-grey-950 tracking-[-0.02em]">
              Pretendard
            </span>
            <span className="text-[48px] font-light text-grey-300 tracking-[-0.02em]">
              Ag
            </span>
          </div>
          <div className="flex items-center justify-between px-[40px] py-[32px]">
            <span className="text-[48px] font-medium text-grey-950 tracking-[-0.02em]">
              프리텐다드
            </span>
            <span className="text-[48px] font-light text-grey-300 tracking-[-0.02em]">
              가나
            </span>
          </div>
          <div className="px-[40px] py-[20px] bg-grey-50 border-t border-grey-100 flex items-center justify-between">
            <span className="text-[13px] text-grey-500">
              Weights: Regular 400 &middot; Medium 500 &middot; SemiBold 600
            </span>
            <span className="text-[13px] text-primary-main font-medium cursor-pointer hover:underline">
              Download &rarr;
            </span>
          </div>
        </div>

        <SectionHeading
          id="typo-1"
          title="Guidelines"
          desc="텍스트 스타일을 적용할 때 준수하는 규칙입니다."
        />
        <div className="grid grid-cols-2 gap-[16px] mb-[64px]">
          <div className="bg-white border border-grey-200 rounded-xl p-[28px]">
            <div className="flex items-center gap-[8px] mb-[12px]">
              <div className="w-[6px] h-[6px] rounded-full bg-primary-main" />
              <span className="text-[14px] font-semibold text-grey-800">
                24px 이상
              </span>
            </div>
            <div className="flex gap-[24px]">
              <div>
                <p className="text-[11px] text-grey-400 uppercase tracking-[0.05em] mb-[4px]">
                  Line Height
                </p>
                <p className="text-[20px] font-semibold text-grey-950">140%</p>
              </div>
              <div>
                <p className="text-[11px] text-grey-400 uppercase tracking-[0.05em] mb-[4px]">
                  Letter Spacing
                </p>
                <p className="text-[20px] font-semibold text-grey-950">-2%</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-grey-200 rounded-xl p-[28px]">
            <div className="flex items-center gap-[8px] mb-[12px]">
              <div className="w-[6px] h-[6px] rounded-full bg-secondary-main" />
              <span className="text-[14px] font-semibold text-grey-800">
                20px 이하
              </span>
            </div>
            <div className="flex gap-[24px]">
              <div>
                <p className="text-[11px] text-grey-400 uppercase tracking-[0.05em] mb-[4px]">
                  Line Height
                </p>
                <p className="text-[20px] font-semibold text-grey-950">150%</p>
              </div>
              <div>
                <p className="text-[11px] text-grey-400 uppercase tracking-[0.05em] mb-[4px]">
                  Letter Spacing
                </p>
                <p className="text-[20px] font-semibold text-grey-950">
                  -2.5%
                </p>
              </div>
            </div>
          </div>
        </div>

        <SectionHeading
          id="typo-2"
          title="Type Scale"
          desc="13가지 텍스트 스타일과 사용 예시입니다."
        />
        <div className="bg-white border border-grey-200 rounded-xl overflow-hidden mb-[64px]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-grey-200">
                {["Style", "Size", "Weight", "Token", "Preview"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[12px] text-grey-400 font-medium px-[20px] py-[14px] uppercase tracking-[0.05em]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: "h1", size: "60px", weight: "600", cls: "text-h1", token: "text-h1" },
                { name: "h2", size: "48px", weight: "600", cls: "text-h2", token: "text-h2" },
                { name: "h3", size: "32px", weight: "600", cls: "text-h3", token: "text-h3" },
                { name: "h4", size: "24px", weight: "600", cls: "text-h4", token: "text-h4" },
                { name: "h5", size: "20px", weight: "600", cls: "text-h5", token: "text-h5" },
                { name: "subtitle1", size: "18px", weight: "600", cls: "text-subtitle1", token: "text-subtitle1" },
                { name: "subtitle2", size: "16px", weight: "600", cls: "text-subtitle2", token: "text-subtitle2" },
                { name: "body1", size: "16px", weight: "400", cls: "text-body1", token: "text-body1" },
                { name: "body2", size: "14px", weight: "600", cls: "text-body2", token: "text-body2" },
                { name: "caption1", size: "14px", weight: "500", cls: "text-caption1", token: "text-caption1" },
                { name: "caption2", size: "14px", weight: "400", cls: "text-caption2", token: "text-caption2" },
                { name: "caption3", size: "12px", weight: "500", cls: "text-caption3", token: "text-caption3" },
                { name: "button", size: "12px", weight: "600", cls: "text-button", token: "text-button" },
              ].map((t) => (
                <tr
                  key={t.name}
                  className="border-b border-grey-100 last:border-b-0 hover:bg-grey-50 transition-colors"
                >
                  <td className="px-[20px] py-[18px] text-[14px] text-grey-950 font-semibold">
                    {t.name}
                  </td>
                  <td className="px-[20px] py-[18px] text-[13px] text-grey-500">
                    {t.size}
                  </td>
                  <td className="px-[20px] py-[18px] text-[13px] text-grey-500">
                    {t.weight}
                  </td>
                  <td className="px-[20px] py-[18px] text-[13px] text-grey-500 font-mono">
                    {t.token}
                  </td>
                  <td className="px-[20px] py-[18px]">
                    <span
                      className="text-grey-950"
                      style={{ fontSize: t.size, fontWeight: Number(t.weight), lineHeight: 1.4 }}
                    >
                      다람쥐 헌 쳇바퀴
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   Radius
   ============================================================ */
function RadiusTab() {
  const radii = [4, 6, 8, 10, 12, 16, 20, 24, 28];
  return (
    <div className="flex">
      <TabSidebar title="Radius" items={[{ label: "Overview", id: "radius-overview" }]} />
      <section className="flex-1 px-[60px] py-[48px] min-h-screen">
        <div className="mb-[60px]">
          <h2 className="text-[32px] font-semibold text-grey-950 tracking-[-0.02em] leading-[1.3]">
            Radius
          </h2>
          <p className="text-[15px] text-grey-500 mt-[12px] leading-[1.7] max-w-[640px]">
            Pick&amp;Save 서비스 내에서 사용되는 라운드를 정의합니다. 라운드는
            2px 단위로 적용하며, 일관된 브랜드로 보일 수 있도록 상황에 맞춰
            유연하게 사용합니다.
          </p>
        </div>
        <div id="radius-overview" className="scroll-mt-[80px] grid grid-cols-3 gap-[20px]">
          {radii.map((r) => (
            <div
              key={r}
              className="bg-white border border-grey-200 rounded-xl p-[32px] flex flex-col items-center hover:shadow-md transition-shadow"
            >
              <div
                className="w-[120px] h-[120px] bg-primary-main mb-[20px]"
                style={{ borderRadius: `${r}px` }}
              />
              <span className="text-[24px] font-semibold text-grey-950">
                {r}px
              </span>
              <span className="text-[12px] text-grey-400 font-mono mt-[4px]">
                border-radius: {r}px
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   Used Case
   ============================================================ */
function UsedCaseTab() {
  return (
    <div className="flex">
      <TabSidebar
        title="Used Case"
        items={[
          { label: "Primary", id: "uc-primary" },
          { label: "Secondary", id: "uc-secondary" },
          { label: "Moodboard", id: "uc-moodboard" },
        ]}
      />
      <section className="flex-1 px-[60px] py-[48px] min-h-screen">
        <div className="mb-[60px]">
          <h2 className="text-[32px] font-semibold text-grey-950 tracking-[-0.02em] leading-[1.3]">
            Used Case
          </h2>
          <p className="text-[15px] text-grey-500 mt-[12px] leading-[1.7] max-w-[640px]">
            각 컬러가 실제 UI에 어떻게 적용되는지 확인할 수 있는 사용 예시입니다.
          </p>
        </div>

        <SectionHeading
          id="uc-primary"
          title="Primary Color"
          desc="브랜드 경험에 직접적인 영향을 주는 버튼, 활성 상태 및 UI 전체의 주요 구성 요소에 사용합니다."
        />
        <div className="flex items-start gap-[40px] mb-[64px]">
          {/* Annotation labels */}
          <div className="w-[200px] shrink-0 flex flex-col gap-[20px] pt-[100px]">
            <div className="flex items-center gap-[8px]">
              <span className="text-[13px] text-grey-400 whitespace-nowrap">Active state</span>
              <div className="flex-1 h-[1px] bg-grey-300" />
            </div>
            <div className="flex items-center gap-[8px]">
              <span className="text-[13px] text-grey-400 whitespace-nowrap">Primary color</span>
              <div className="flex-1 h-[1px] bg-grey-300" />
            </div>
          </div>
          {/* Phone mockup */}
          <div className="w-[320px] bg-white border border-grey-200 rounded-[28px] overflow-hidden shadow-lg">
            <div className="h-[36px] bg-grey-50" />
            <div className="px-[20px] pt-[16px]">
              <h3 className="text-[20px] font-semibold text-grey-950">
                Title
              </h3>
            </div>
            <div className="px-[20px] pt-[12px]">
              <div className="flex gap-[4px]">
                <div className="flex-1 h-[36px] bg-primary-main rounded-lg flex items-center justify-center">
                  <span className="text-[12px] text-white">Label</span>
                </div>
                <div className="flex-1 h-[36px] bg-primary-simpleLighter rounded-lg flex items-center justify-center">
                  <span className="text-[12px] text-primary-main">Label</span>
                </div>
                <div className="flex-1 h-[36px] bg-primary-simpleLighter rounded-lg flex items-center justify-center">
                  <span className="text-[12px] text-primary-main">Label</span>
                </div>
              </div>
            </div>
            <div className="px-[20px] pt-[16px] pb-[20px]">
              <div className="flex gap-[4px]">
                <button className="flex-1 h-[36px] bg-primary-main rounded-lg text-[12px] text-white">
                  Button
                </button>
                <button className="flex-1 h-[36px] border border-primary-main rounded-lg text-[12px] text-primary-main">
                  Button
                </button>
              </div>
            </div>
          </div>
        </div>

        <SectionHeading
          id="uc-secondary"
          title="Secondary Color"
          desc="UI 요소들의 기능 또는 정보 유형에 따라 의미를 강조하여 전달하는 목적으로 보조적으로 사용합니다."
        />
        <div className="flex justify-center mb-[64px]">
          <div className="w-[320px] bg-white border border-grey-200 rounded-[28px] overflow-hidden shadow-lg">
            <div className="h-[36px] bg-grey-50" />
            <div className="px-[20px] pt-[8px] flex items-center justify-between">
              <span className="text-subtitle2 text-grey-950">
                Pick&amp;Save
              </span>
              <div className="w-[20px] h-[20px] rounded bg-grey-200" />
            </div>
            <div className="mx-[20px] mt-[12px] h-[140px] bg-grey-100 rounded-xl flex items-center justify-center">
              <div className="w-[48px] h-[48px] rounded-full bg-secondary-main flex items-center justify-center">
                <span className="text-[20px] text-white">!</span>
              </div>
            </div>
            <div className="px-[20px] py-[16px] flex flex-col gap-[6px]">
              <div className="h-[10px] bg-grey-100 rounded-full w-[60%]" />
              <div className="h-[10px] bg-grey-100 rounded-full w-[80%]" />
              <div className="h-[10px] bg-grey-100 rounded-full w-[40%]" />
            </div>
          </div>
        </div>

        <SectionHeading id="uc-moodboard" title="Moodboard" />
        <div className="grid grid-cols-3 gap-[20px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[200px] rounded-2xl overflow-hidden"
              style={{
                background: [
                  "linear-gradient(135deg, #0f176c 0%, #1a237e 100%)",
                  "linear-gradient(135deg, #f0759c 0%, #e91e63 100%)",
                  "linear-gradient(135deg, #eaebec 0%, #f7f8f9 100%)",
                  "linear-gradient(135deg, #171719 0%, #292a2d 100%)",
                  "linear-gradient(135deg, #0f176c 0%, #f0759c 100%)",
                  "linear-gradient(135deg, #f7f8f9 0%, #dbdcdf 100%)",
                ][i],
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <span
                  className={`text-[14px] font-medium ${i < 2 || i === 3 || i === 4 ? "text-white/30" : "text-grey-300"}`}
                >
                  image
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   Grid
   ============================================================ */
function GridTab() {
  return (
    <div className="flex">
      <TabSidebar title="Grid" items={[{ label: "Mobile Grid", id: "grid-mobile" }, { label: "Specifications", id: "grid-general" }]} />
      <section className="flex-1 px-[60px] py-[48px] min-h-screen">
        <div className="mb-[60px]">
          <h2 className="text-[32px] font-semibold text-grey-950 tracking-[-0.02em] leading-[1.3]">
            Grid Layout
          </h2>
          <p className="text-[15px] text-grey-500 mt-[12px] leading-[1.7] max-w-[640px]">
            화면 레이아웃의 기준이 되는 그리드 시스템을 정의합니다.
          </p>
        </div>

        <SectionHeading
          id="grid-mobile"
          title="Mobile Grid"
          desc="6컬럼 그리드, Margin 16px, Gutter 16px"
        />
        <div className="flex gap-[48px] mb-[64px]">
          <div className="flex-1 bg-white border border-grey-200 rounded-2xl p-[32px]">
            <div className="flex justify-center">
              <div className="w-[280px] border border-grey-200 rounded-[28px] overflow-hidden bg-white">
                <div className="h-[48px] bg-grey-50 flex items-center justify-center">
                  <span className="text-[10px] text-grey-300">Status Bar</span>
                </div>
                <div className="h-[44px] bg-white border-b border-grey-100 flex items-center px-[14px]">
                  <div className="w-[28px] h-[28px] rounded-full bg-grey-200" />
                  <div className="ml-auto flex gap-[3px]">
                    <div className="w-[18px] h-[18px] rounded bg-grey-200" />
                    <div className="w-[18px] h-[18px] rounded bg-grey-200" />
                  </div>
                </div>
                <div className="px-[14px] py-[16px]">
                  {Array.from({ length: 3 }).map((_, row) => (
                    <div
                      key={row}
                      className={`grid grid-cols-6 gap-[14px] ${row > 0 ? "mt-[14px]" : ""}`}
                    >
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-[56px] bg-primary-simpleLighter border border-primary-lighter rounded"
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="h-[64px] border-t border-grey-200 bg-white flex items-center justify-center">
                  <span className="text-[10px] text-grey-300">Nav Bar</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-[320px] shrink-0 flex flex-col gap-[32px]">
            <div className="bg-white border border-grey-200 rounded-xl p-[24px]">
              <p className="text-[11px] text-grey-400 uppercase tracking-[0.05em] mb-[16px]">
                Viewport
              </p>
              <div className="flex justify-between mb-[8px]">
                <span className="text-[13px] text-grey-600">Min width</span>
                <span className="text-[14px] text-grey-950 font-semibold">
                  375px
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[13px] text-grey-600">Max width</span>
                <span className="text-[14px] text-grey-950 font-semibold">
                  640px
                </span>
              </div>
            </div>
            <div className="bg-white border border-grey-200 rounded-xl p-[24px]">
              <p className="text-[11px] text-grey-400 uppercase tracking-[0.05em] mb-[16px]">
                Grid
              </p>
              <div className="flex justify-between mb-[8px]">
                <span className="text-[13px] text-grey-600">Columns</span>
                <span className="text-[14px] text-grey-950 font-semibold">
                  6
                </span>
              </div>
              <div className="flex justify-between mb-[8px]">
                <span className="text-[13px] text-grey-600">Margin</span>
                <span className="text-[14px] text-grey-950 font-semibold">
                  16px
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[13px] text-grey-600">Gutter</span>
                <span className="text-[14px] text-grey-950 font-semibold">
                  16px
                </span>
              </div>
            </div>
            <div className="bg-white border border-grey-200 rounded-xl p-[24px]">
              <p className="text-[11px] text-grey-400 uppercase tracking-[0.05em] mb-[16px]">
                Layout Bars
              </p>
              {[
                { n: "Status Bar", v: "60px" },
                { n: "Top Bar", v: "52px" },
                { n: "Bottom Button", v: "80px" },
                { n: "Nav Bar", v: "88px" },
              ].map((b) => (
                <div
                  key={b.n}
                  className="flex justify-between mb-[8px] last:mb-0"
                >
                  <span className="text-[13px] text-grey-600">{b.n}</span>
                  <span className="text-[14px] text-grey-950 font-semibold">
                    {b.v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <SectionHeading id="grid-general" title="General Grid" />
        <div className="bg-white border border-grey-200 rounded-xl p-[24px]">
          <div className="grid grid-cols-3 gap-[24px]">
            {[
              { label: "Min Width", value: "375px" },
              { label: "Min Height", value: "812px" },
              { label: "Max Width", value: "600px" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-[11px] text-grey-400 uppercase tracking-[0.05em] mb-[4px]">
                  {s.label}
                </p>
                <p className="text-[24px] font-semibold text-grey-950">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   Screen (Mobile / PC)
   ============================================================ */
function MobilePcTab() {
  const screens = [
    {
      name: "Home",
      topContent: (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-[3px]">
            <span className="text-[11px] text-grey-800 font-semibold">
              장소명
            </span>
            <span className="text-[9px] text-grey-400">▼</span>
          </div>
          <div className="flex gap-[4px]">
            <div className="w-[16px] h-[16px] rounded bg-grey-200" />
            <div className="w-[16px] h-[16px] rounded bg-grey-200" />
          </div>
        </div>
      ),
      bottom: "nav" as const,
    },
    { name: "Sub + Nav", topContent: null, bottom: "nav" as const },
    { name: "Sub + Button", topContent: null, bottom: "button" as const },
    { name: "Tooltip", topContent: null, bottom: "indicator" as const },
    { name: "Popup", topContent: null, bottom: "overlay" as const },
  ];

  return (
    <div className="flex">
      <TabSidebar title="Screen" items={[{ label: "Mobile", id: "screen-mobile" }, { label: "PC", id: "screen-pc" }, { label: "Components", id: "screen-components" }]} />
      <section className="flex-1 px-[60px] py-[48px] min-h-screen">
        <div className="mb-[60px]">
          <h2 className="text-[32px] font-semibold text-grey-950 tracking-[-0.02em] leading-[1.3]">
            Screen
          </h2>
          <p className="text-[15px] text-grey-500 mt-[12px] leading-[1.7] max-w-[640px]">
            모바일 및 PC 화면의 기본 레이아웃 구조를 정의합니다.
          </p>
        </div>

        <SectionHeading
          id="screen-mobile"
          title="Mobile"
          desc="5가지 화면 레이아웃 유형입니다."
        />
        <div className="grid grid-cols-3 gap-[20px] mb-[64px]">
          {screens.map((s) => (
            <div
              key={s.name}
              className="flex flex-col items-center gap-[8px]"
            >
              <div className="w-full aspect-[375/812] bg-white border border-grey-200 rounded-[24px] overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                {/* Status Bar */}
                <div className="h-[7.4%] bg-grey-50 flex items-end justify-between px-[12px] pb-[4px]">
                  <span className="text-[9px] text-grey-800 font-semibold">
                    09:41
                  </span>
                  <div className="flex gap-[2px]">
                    <div className="w-[10px] h-[7px] bg-grey-800 rounded-[1px]" />
                    <div className="w-[10px] h-[7px] bg-grey-800 rounded-[1px]" />
                  </div>
                </div>
                {/* Top Bar */}
                <div className="h-[6.4%] bg-white flex items-center px-[12px] border-b border-grey-100 shrink-0">
                  {s.topContent || (
                    <>
                      <div className="flex gap-[4px]">
                        <span className="text-[11px] text-grey-500">
                          &#x2715;
                        </span>
                        <span className="text-[11px] text-grey-500">
                          &#x2190;
                        </span>
                      </div>
                      <span className="text-[11px] text-grey-800 font-semibold mx-auto">
                        Title
                      </span>
                      <span className="text-[10px] text-grey-400">편집</span>
                    </>
                  )}
                </div>
                {/* Content */}
                <div className="flex-1 bg-grey-50 relative flex items-center justify-center">
                  {s.bottom === "overlay" && (
                    <div className="absolute inset-0 bg-grey-950/40 flex items-center justify-center">
                      <div className="bg-white rounded-xl p-[16px] w-[60%]">
                        <p className="text-[12px] text-grey-800 font-semibold text-center">
                          Title
                        </p>
                        <p className="text-[9px] text-grey-400 text-center mt-[2px]">
                          caption
                        </p>
                        <div className="flex gap-[6px] mt-[10px]">
                          <div className="flex-1 h-[28px] border border-grey-300 rounded-lg text-[10px] text-grey-500 flex items-center justify-center">
                            CANCEL
                          </div>
                          <div className="flex-1 h-[28px] bg-primary-main rounded-lg text-[10px] text-white flex items-center justify-center">
                            BUTTON
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {s.bottom === "indicator" && (
                    <div className="absolute bottom-[12px] left-1/2 -translate-x-1/2">
                      <div className="bg-grey-700 text-white text-[9px] px-[10px] py-[4px] rounded-lg mb-[6px] whitespace-nowrap">
                        내용이 들어갑니다
                      </div>
                    </div>
                  )}
                </div>
                {/* Bottom */}
                {s.bottom === "nav" && (
                  <div className="h-[10.8%] border-t border-grey-200 bg-white flex items-center justify-around px-[12px] shrink-0">
                    {["홈", "근처", "픽업", "마이"].map((l) => (
                      <div
                        key={l}
                        className="flex flex-col items-center gap-[2px]"
                      >
                        <div className="w-[16px] h-[16px] rounded bg-grey-200" />
                        <span className="text-[8px] text-grey-400">{l}</span>
                      </div>
                    ))}
                  </div>
                )}
                {s.bottom === "button" && (
                  <div className="h-[9.8%] bg-white border-t border-grey-200 flex items-center justify-center px-[12px] shrink-0">
                    <div className="w-full h-[70%] bg-primary-main rounded-xl flex items-center justify-center">
                      <span className="text-[10px] text-white font-semibold">
                        BUTTON
                      </span>
                    </div>
                  </div>
                )}
                {s.bottom === "indicator" && (
                  <div className="h-[4%] bg-white flex items-end justify-center pb-[4px] shrink-0">
                    <div className="w-[35%] h-[3px] bg-grey-800 rounded-full" />
                  </div>
                )}
              </div>
              <span className="text-[13px] font-medium text-grey-700">
                {s.name}
              </span>
            </div>
          ))}
        </div>

        <SectionHeading
          id="screen-pc"
          title="PC"
          desc="PC 화면은 디자인 진행 전입니다."
        />
        <div
          className="bg-white border border-grey-200 rounded-xl overflow-hidden mb-[64px]"
          style={{ aspectRatio: "16/9" }}
        >
          <div className="h-[24px] bg-grey-50 border-b border-grey-100" />
          <div className="h-[20px] bg-white border-b border-grey-100 flex items-center px-[16px]">
            <div className="w-[14px] h-[14px] rounded-full bg-grey-200" />
            <div className="ml-auto flex gap-[3px]">
              <div className="w-[10px] h-[10px] rounded bg-grey-200" />
              <div className="w-[10px] h-[10px] rounded bg-grey-200" />
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center py-[80px]">
            <div className="text-center">
              <span className="text-[15px] text-grey-300">
                기본 그리드 640px 기준
              </span>
              <p className="text-[12px] text-grey-300 mt-[4px]">
                1920 x 1080
              </p>
            </div>
          </div>
          <div className="h-[36px] border-t border-grey-100 bg-white flex items-center justify-center">
            <span className="text-[10px] text-grey-300">Navigation Bar</span>
          </div>
        </div>

        <SectionHeading
          id="screen-components"
          title="Components"
          desc="화면에 사용되는 공통 UI 컴포넌트입니다."
        />
        <InteractiveComponents />
      </section>
    </div>
  );
}

/* ============================================================
   Interactive Components (Screen tab)
   ============================================================ */
function InteractiveComponents() {
  const [btnActive, setBtnActive] = useState(0);
  const [popupOpen, setPopupOpen] = useState<null | "confirm" | "delete">(null);
  const [radio, setRadio] = useState<"a" | "b">("b");
  const [toggle, setToggle] = useState(true);
  const [checkbox, setCheckbox] = useState(true);

  return (
    <div className="grid grid-cols-2 gap-[20px]">
      {/* Buttons */}
      <div className="bg-white border border-grey-200 rounded-xl p-[24px]">
        <p className="text-[12px] text-grey-400 font-semibold uppercase tracking-[0.05em] mb-[16px]">
          Button
        </p>
        <div className="flex flex-wrap gap-[8px]">
          {[
            { label: "BUTTON", style: "primary-pill" },
            { label: "BUTTON", style: "outline-pill" },
            { label: "BUTTON", style: "primary-rect" },
            { label: "DISABLED", style: "disabled" },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={() => btn.style !== "disabled" && setBtnActive(i)}
              disabled={btn.style === "disabled"}
              className={`h-[36px] px-[20px] text-[12px] font-semibold transition-all ${
                btn.style === "primary-pill"
                  ? `rounded-full ${btnActive === i ? "bg-primary-main text-white scale-95 shadow-lg" : "bg-primary-main text-white hover:bg-primary-light"}`
                  : btn.style === "outline-pill"
                    ? `rounded-full border bg-white ${btnActive === i ? "border-primary-main text-primary-main scale-95 shadow-lg" : "border-grey-300 text-grey-700 hover:border-grey-500"}`
                    : btn.style === "primary-rect"
                      ? `rounded-lg ${btnActive === i ? "bg-primary-main text-white scale-95 shadow-lg" : "bg-primary-main text-white hover:bg-primary-light"}`
                      : "rounded-lg bg-grey-300 text-white cursor-not-allowed"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
        {btnActive !== null && (
          <p className="text-[11px] text-grey-400 mt-[12px]">
            Active: Button {btnActive + 1}
          </p>
        )}
      </div>

      {/* Popup */}
      <div className="bg-white border border-grey-200 rounded-xl p-[24px] relative">
        <p className="text-[12px] text-grey-400 font-semibold uppercase tracking-[0.05em] mb-[16px]">
          Popup
        </p>
        <div className="flex gap-[12px]">
          <button
            onClick={() => setPopupOpen("confirm")}
            className="border border-grey-200 rounded-xl p-[16px] w-[160px] hover:shadow-md transition-shadow text-left"
          >
            <p className="text-[13px] text-grey-800 font-semibold text-center">Title</p>
            <p className="text-[11px] text-grey-400 text-center mt-[2px]">Click to open</p>
            <div className="flex gap-[6px] mt-[12px]">
              <span className="flex-1 h-[28px] border border-grey-300 rounded-lg text-[11px] text-grey-600 flex items-center justify-center">CANCEL</span>
              <span className="flex-1 h-[28px] bg-primary-main rounded-lg text-[11px] text-white flex items-center justify-center">BUTTON</span>
            </div>
          </button>
          <button
            onClick={() => setPopupOpen("delete")}
            className="border border-grey-200 rounded-xl p-[16px] w-[160px] hover:shadow-md transition-shadow text-left"
          >
            <p className="text-[13px] text-grey-800 font-semibold text-center">Title</p>
            <p className="text-[11px] text-grey-400 text-center mt-[2px]">Click to open</p>
            <div className="flex gap-[6px] mt-[12px]">
              <span className="flex-1 h-[28px] border border-grey-300 rounded-lg text-[11px] text-grey-600 flex items-center justify-center">CANCEL</span>
              <span className="flex-1 h-[28px] bg-red-500 rounded-lg text-[11px] text-white flex items-center justify-center">DELETE</span>
            </div>
          </button>
        </div>
        {/* Popup overlay */}
        {popupOpen && (
          <div className="absolute inset-0 bg-grey-950/40 rounded-xl flex items-center justify-center z-10">
            <div className="bg-white rounded-xl p-[24px] w-[240px] shadow-xl">
              <p className="text-[15px] text-grey-800 font-semibold text-center">
                {popupOpen === "confirm" ? "확인하시겠습니까?" : "삭제하시겠습니까?"}
              </p>
              <p className="text-[12px] text-grey-400 text-center mt-[4px]">
                이 작업은 되돌릴 수 없습니다
              </p>
              <div className="flex gap-[8px] mt-[16px]">
                <button
                  onClick={() => setPopupOpen(null)}
                  className="flex-1 h-[36px] border border-grey-300 rounded-lg text-[13px] text-grey-600 hover:bg-grey-50 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => setPopupOpen(null)}
                  className={`flex-1 h-[36px] rounded-lg text-[13px] text-white transition-colors ${
                    popupOpen === "confirm"
                      ? "bg-primary-main hover:bg-primary-light"
                      : "bg-red-500 hover:bg-red-700"
                  }`}
                >
                  {popupOpen === "confirm" ? "CONFIRM" : "DELETE"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white border border-grey-200 rounded-xl p-[24px]">
        <p className="text-[12px] text-grey-400 font-semibold uppercase tracking-[0.05em] mb-[16px]">
          Controls
        </p>
        <div className="flex gap-[32px] items-center">
          {/* Radio */}
          <div className="flex flex-col gap-[10px]">
            <button onClick={() => setRadio("a")} className="flex items-center gap-[8px]">
              <div className={`w-[18px] h-[18px] rounded-full border-2 transition-all ${radio === "a" ? "border-[5px] border-primary-main" : "border-grey-300 hover:border-grey-400"}`} />
              <span className={`text-[13px] ${radio === "a" ? "text-grey-800" : "text-grey-600"}`}>Option A</span>
            </button>
            <button onClick={() => setRadio("b")} className="flex items-center gap-[8px]">
              <div className={`w-[18px] h-[18px] rounded-full border-2 transition-all ${radio === "b" ? "border-[5px] border-primary-main" : "border-grey-300 hover:border-grey-400"}`} />
              <span className={`text-[13px] ${radio === "b" ? "text-grey-800" : "text-grey-600"}`}>Option B</span>
            </button>
          </div>
          {/* Toggle */}
          <div className="flex flex-col gap-[10px]">
            <button
              onClick={() => setToggle(!toggle)}
              className={`w-[40px] h-[22px] rounded-full relative transition-colors ${toggle ? "bg-primary-main" : "bg-grey-300"}`}
            >
              <div className={`absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full shadow transition-all ${toggle ? "right-[2px]" : "left-[2px]"}`} />
            </button>
            <span className="text-[11px] text-grey-500">{toggle ? "ON" : "OFF"}</span>
          </div>
          {/* Checkbox */}
          <div className="flex flex-col gap-[10px]">
            <button onClick={() => setCheckbox(!checkbox)} className="flex items-center gap-[8px]">
              <div className={`w-[18px] h-[18px] rounded transition-all flex items-center justify-center ${checkbox ? "bg-primary-main" : "border border-grey-300 bg-white hover:border-grey-400"}`}>
                {checkbox && <span className="text-[10px] text-white">&#10003;</span>}
              </div>
              <span className={`text-[13px] ${checkbox ? "text-grey-800" : "text-grey-600"}`}>
                {checkbox ? "Checked" : "Unchecked"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border border-grey-200 rounded-xl p-[24px]">
        <p className="text-[12px] text-grey-400 font-semibold uppercase tracking-[0.05em] mb-[16px]">
          Input
        </p>
        <div className="flex flex-col gap-[12px]">
          <input
            type="text"
            placeholder="Placeholder"
            className="h-[48px] w-full rounded-xl px-[16px] text-[14px] text-grey-800 placeholder:text-grey-400 bg-grey-50 border border-grey-200 focus:border-primary-main focus:bg-white transition-colors outline-none"
          />
          <input
            type="text"
            defaultValue="Active input"
            className="h-[48px] w-full rounded-xl px-[16px] text-[14px] text-grey-800 bg-white border-2 border-primary-main outline-none"
          />
          <div>
            <input
              type="text"
              defaultValue="Error input"
              className="h-[48px] w-full rounded-xl px-[16px] text-[14px] text-grey-800 bg-white border border-red-500 outline-none"
            />
            <span className="text-[12px] text-red-500 mt-[6px] block">Error message</span>
          </div>
          <div className="relative">
            <div className="h-[48px] w-full rounded-xl px-[16px] bg-grey-50 border border-grey-200 flex items-center">
              <span className="text-[14px] text-grey-800 tracking-[4px]">&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;</span>
              <span className="ml-auto text-[16px] text-grey-400 cursor-pointer select-none">&#128065;</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Card
   ============================================================ */
function CardTab() {
  const CardPreview = ({
    title,
    w,
    h,
    children,
  }: {
    title: string;
    w: string;
    h: string;
    children: React.ReactNode;
  }) => (
    <div className="bg-white border border-grey-200 rounded-xl p-[24px] hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-[16px]">
        <span className="text-[14px] font-semibold text-grey-800">
          {title}
        </span>
        <span className="text-[12px] text-grey-400 font-mono">
          {w} x {h}
        </span>
      </div>
      {children}
    </div>
  );

  return (
    <div className="flex">
      <TabSidebar
        title="Card"
        items={[
          { label: "Product", id: "card-product" },
          { label: "Store", id: "card-store" },
          { label: "Store Detail", id: "card-store-detail" },
          { label: "Pickup", id: "card-pickup" },
        ]}
      />
      <section className="flex-1 px-[60px] py-[48px] min-h-screen">
        <div className="mb-[60px]">
          <h2 className="text-[32px] font-semibold text-grey-950 tracking-[-0.02em] leading-[1.3]">
            Card
          </h2>
          <p className="text-[15px] text-grey-500 mt-[12px] leading-[1.7] max-w-[640px]">
            서비스에서 사용되는 카드 컴포넌트의 스펙과 사용 예시입니다.
          </p>
        </div>

        <SectionHeading
          id="card-product"
          title="상품 Card (Small)"
          desc="상품 리스트에서 사용되는 카드입니다. 2열 그리드로 배치됩니다."
        />
        <div className="grid grid-cols-2 gap-[20px] mb-[64px]">
          <CardPreview title="상품 card - small" w="163.5" h="368.5">
            <div className="flex gap-[16px]">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="w-[163.5px] rounded-xl border border-grey-200 overflow-hidden"
                >
                  <div className="aspect-square bg-grey-100" />
                  <div className="p-[8px]">
                    <span className="text-[11px] text-grey-400 block">
                      브랜드명
                    </span>
                    <span className="text-[13px] text-grey-800 block mt-[2px]">
                      상품명이 들어갑니다
                    </span>
                    <span className="text-[13px] text-grey-950 font-semibold block mt-[4px]">
                      12,000원
                    </span>
                    <span className="text-[11px] text-grey-400 block mt-[2px]">
                      매장명
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardPreview>
          <div className="bg-white border border-grey-200 rounded-xl p-[24px]">
            <span className="text-[14px] font-semibold text-grey-800 mb-[16px] block">
              Usage
            </span>
            <div className="bg-grey-50 rounded-lg p-[16px] font-mono text-[12px] text-grey-600 leading-[1.8]">
              <span className="text-primary-main">{"<div"}</span> className=
              <span className="text-secondary-main">
                {'"w-card-product-sm h-card-product-sm"'}
              </span>
              <span className="text-primary-main">{">"}</span>
              <br />
              &nbsp;&nbsp;...
              <br />
              <span className="text-primary-main">{"</div>"}</span>
            </div>
          </div>
        </div>

        <SectionHeading
          id="card-store"
          title="매장 Card"
          desc="매장 리스트에서 사용되는 카드입니다."
        />
        <div className="grid grid-cols-2 gap-[20px] mb-[64px]">
          <CardPreview title="매장 card" w="343" h="228">
            <div className="w-[343px] rounded-xl border border-grey-200 overflow-hidden">
              <div className="h-[140px] bg-grey-100" />
              <div className="p-[12px]">
                <span className="text-[14px] text-grey-800 font-semibold block">
                  매장 이름이 들어갑니다
                </span>
                <span className="text-[12px] text-grey-500 block mt-[4px]">
                  매장 설명이 들어갑니다
                </span>
              </div>
            </div>
          </CardPreview>
          <div className="bg-white border border-grey-200 rounded-xl p-[24px]">
            <span className="text-[14px] font-semibold text-grey-800 mb-[16px] block">
              Specs
            </span>
            <div className="flex flex-col gap-[8px]">
              {[
                { l: "Width", v: "343px" },
                { l: "Height", v: "228px" },
                { l: "Image Height", v: "140px" },
                { l: "Border Radius", v: "12px" },
              ].map((s) => (
                <div key={s.l} className="flex justify-between">
                  <span className="text-[13px] text-grey-500">{s.l}</span>
                  <span className="text-[13px] text-grey-950 font-semibold">
                    {s.v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <SectionHeading
          id="card-store-detail"
          title="매장상세 상품 추가 Card"
          desc="매장 상세 페이지에서 상품을 추가할 때 사용됩니다."
        />
        <div className="grid grid-cols-2 gap-[20px] mb-[64px]">
          <CardPreview title="매장상세 상품 추가 card" w="343" h="156">
            <div className="w-[343px] h-[156px] border border-grey-200 rounded-xl flex overflow-hidden">
              <div className="w-[120px] h-[120px] bg-grey-100 rounded-lg shrink-0 m-[18px]" />
              <div className="p-[16px] flex flex-col justify-center">
                <span className="text-[13px] text-grey-800">
                  상품명이 들어갑니다
                </span>
                <span className="text-[13px] text-grey-950 font-semibold mt-[4px]">
                  8,000원
                </span>
                <span className="text-[11px] text-grey-400 mt-[4px]">
                  상품 설명이 들어갑니다
                </span>
              </div>
            </div>
          </CardPreview>
          <div className="bg-white border border-grey-200 rounded-xl p-[24px]">
            <span className="text-[14px] font-semibold text-grey-800 mb-[16px] block">
              Specs
            </span>
            <div className="flex flex-col gap-[8px]">
              {[
                { l: "Width", v: "343px" },
                { l: "Height", v: "156px" },
                { l: "Image", v: "120 x 120px" },
                { l: "Border Radius", v: "12px" },
              ].map((s) => (
                <div key={s.l} className="flex justify-between">
                  <span className="text-[13px] text-grey-500">{s.l}</span>
                  <span className="text-[13px] text-grey-950 font-semibold">
                    {s.v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <SectionHeading
          id="card-pickup"
          title="픽업 예약하기 상품 Card"
          desc="픽업 예약 화면에서 사용되는 카드입니다."
        />
        <div className="grid grid-cols-2 gap-[20px]">
          <CardPreview title="픽업 예약하기 상품 card" w="343" h="132">
            <div className="w-[343px] h-[132px] border border-grey-200 rounded-xl flex overflow-hidden">
              <div className="w-[100px] h-[100px] bg-grey-100 rounded-lg shrink-0 m-[16px]" />
              <div className="p-[12px] flex flex-col justify-center">
                <span className="text-[11px] text-grey-400">매장 이름</span>
                <span className="text-[13px] text-grey-800 mt-[2px]">
                  상품명이 들어갑니다
                </span>
                <span className="text-[13px] text-grey-950 font-semibold mt-[4px]">
                  5,000원
                </span>
              </div>
            </div>
          </CardPreview>
          <div className="bg-white border border-grey-200 rounded-xl p-[24px]">
            <span className="text-[14px] font-semibold text-grey-800 mb-[16px] block">
              Specs
            </span>
            <div className="flex flex-col gap-[8px]">
              {[
                { l: "Width", v: "343px" },
                { l: "Height", v: "132px" },
                { l: "Image", v: "100 x 100px" },
                { l: "Border Radius", v: "12px" },
              ].map((s) => (
                <div key={s.l} className="flex justify-between">
                  <span className="text-[13px] text-grey-500">{s.l}</span>
                  <span className="text-[13px] text-grey-950 font-semibold">
                    {s.v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
