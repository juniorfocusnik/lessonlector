import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getWebById } from "./data/webs.js";
import { getAllProgress, isNodeUnlocked } from "./progress.js";
import { escapeHtml, requireLogin } from "./util.js";

const container = document.getElementById("web-container");
const params = new URLSearchParams(window.location.search);
const webId = params.get("web");

const COL_WIDTH = 170;
const ROW_HEIGHT = 110;
const PADDING = 70;

function iconFor(node) {
  if (node.kind === "test") return "▲";
  if (node.kind === "project") return "■";
  if (node.kind === "finalExam") return "★";
  if (!node.requiredForStar) return "◇";
  return "◆";
}

function stateFor(node, completed) {
  if (completed.has(node.id)) return "completed";
  if (isNodeUnlocked(node, completed)) return "available";
  return "locked";
}

function buildGraph(web, completed) {
  const maxX = Math.max(...web.nodes.map((n) => n.x));
  const maxY = Math.max(...web.nodes.map((n) => n.y));
  const width = maxX * COL_WIDTH + PADDING * 2;
  const height = maxY * ROW_HEIGHT + PADDING * 2;
  const pos = (n) => ({ cx: n.x * COL_WIDTH + PADDING, cy: n.y * ROW_HEIGHT + PADDING });

  const edges = [];
  web.nodes.forEach((node) => {
    const to = pos(node);
    node.requires.forEach((reqId) => {
      const reqNode = web.nodes.find((n) => n.id === reqId);
      const from = pos(reqNode);
      const optional = !node.requiredForStar;
      edges.push(
        `<line x1="${from.cx}" y1="${from.cy}" x2="${to.cx}" y2="${to.cy}" class="web-edge${optional ? " web-edge-optional" : ""}" />`
      );
    });
  });

  const nodes = web.nodes.map((node) => {
    const { cx, cy } = pos(node);
    const state = stateFor(node, completed);
    const label = escapeHtml(node.title);
    return `
      <g class="web-node web-node-${state}" data-node-id="${node.id}" transform="translate(${cx},${cy})" tabindex="0">
        <title>${label} (${node.kind === "finalExam" ? "Final Exam" : node.kind})</title>
        <circle r="26" class="web-node-circle" />
        <text class="web-node-icon" text-anchor="middle" dy="8">${iconFor(node)}</text>
        <text class="web-node-label" text-anchor="middle" y="44">${label}</text>
        <text class="web-node-gems" text-anchor="middle" y="60">${node.gems} gems</text>
      </g>
    `;
  });

  return `
    <svg class="web-graph" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMin meet">
      <g class="web-edges">${edges.join("")}</g>
      <g class="web-nodes">${nodes.join("")}</g>
    </svg>
  `;
}

function render(web, completed) {
  const total = web.nodes.length;
  const done = web.nodes.filter((n) => completed.has(n.id)).length;

  container.innerHTML = `
    <a href="../dashboard/index.html" class="back-link">← Back to Dashboard</a>
    <div class="web-header" style="--web-color:${web.color}">
      <span class="web-header-type">${escapeHtml(web.type)} · Years ${escapeHtml(web.yeargroups)}</span>
      <h1>${escapeHtml(web.title)}</h1>
      <p>${escapeHtml(web.description)}</p>
      <p class="web-header-progress">${done}/${total} nodes complete</p>
    </div>
    <div class="web-graph-wrap">
      ${buildGraph(web, completed)}
    </div>
    <p class="web-legend">
      <span class="legend-dot legend-completed"></span> Completed
      <span class="legend-dot legend-available"></span> Available
      <span class="legend-dot legend-locked"></span> Locked
      <span class="legend-dot legend-optional-line"></span> Optional path
    </p>
  `;

  container.querySelectorAll(".web-node-available, .web-node-completed").forEach((el) => {
    el.addEventListener("click", () => {
      const nodeId = el.getAttribute("data-node-id");
      window.location.href = `../lesson/index.html?web=${encodeURIComponent(web.id)}&node=${encodeURIComponent(nodeId)}`;
    });
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") el.click();
    });
  });
}

requireLogin(auth, onAuthStateChanged, async (user) => {
  const web = getWebById(webId);
  if (!web) {
    container.innerHTML = `<p class="empty-state">That web doesn't exist. <a href="../dashboard/index.html" class="inline-link">Back to dashboard</a></p>`;
    return;
  }
  const completed = await getAllProgress(user.uid);
  render(web, completed);
});
