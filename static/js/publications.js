/**
 * publications.js
 *
 * Uses Fuse.js to search window.__PUB_DATA__ (CSL-JSON inlined by Hugo),
 * then shows/hides existing <li> elements by matching their
 * .publication[id] to the CSL-JSON entry id.
 *
 * Facet filtering reads data-year, data-tags attributes on <li>.
 *
 * Expected DOM:
 *   <input id="publication-search">
 *   <div   id="publication-filters">
 *   <p     id="publication-count">
 *   <li><div class="publication" id="{csl-id}">...</div></li>
 */

(function () {
  "use strict";

  // ── index DOM entries by CSL id ────────────────────────────────────────────

  const entriesById = {};
  document.querySelectorAll("div.publication[id]").forEach(div => {
    const li = div.closest("li");
    if (li) entriesById[div.id] = { li, div };
  });

  const allIds = Object.keys(entriesById);
  if (!allIds.length) return;

  // ── build Fuse index from __PUB_DATA__ ────────────────────────────────────

  const rawData = Array.isArray(window.__PUB_DATA__)
    ? window.__PUB_DATA__
    : Object.values(window.__PUB_DATA__ || {});

  const pubData = rawData.filter(p => entriesById[p.id]);

  const fuse = new Fuse(pubData, {
    keys: [
      { name: "title",     weight: 0.5  },
      { name: "abstract",  weight: 0.3  },
      { name: "keywords",  weight: 0.15 },
      { name: "authors",   weight: 0.05 },
    ],
    threshold: 0.35,
    minMatchCharLength: 2,
  });

  // ── facets from data- attributes ──────────────────────────────────────────

  const $search  = document.getElementById("publication-search");
  const $filters = document.getElementById("publication-filters");
  const $count   = document.getElementById("publication-count");

  if (!$filters) return;

  const liList = Object.values(entriesById).map(e => e.div);

  const years = [...new Set(liList.map(div => div.dataset.year).filter(Boolean))].sort((a, b) => b - a);
  const tags  = [...new Set(liList.flatMap(div =>
    (div.dataset.tags || "").split(",").map(t => t.trim()).filter(Boolean)
  ))].sort();

  appendGroup("Year",  years, "year");
  appendGroup("Topic", tags,  "tag");


  function appendGroup(label, values, axis) {
    if (!values.length) return;
    const g = document.createElement("div");
    g.className = "publication-facet-group";
    const h = document.createElement("span");
    h.className   = "publication-facet-label";
    h.textContent = label;
    g.appendChild(h);
    const btns = document.createElement("div");
    btns.className = "publication-facet-group-buttons";
    values.forEach(v => {
      const btn = document.createElement("button");
      btn.type          = "button";
      btn.className     = "publication-facet-btn";
      btn.dataset.axis  = axis;
      btn.dataset.value = v;
      btn.textContent   = v;
      btn.addEventListener("click", () => toggleFilter(axis, v));
      btns.appendChild(btn);
    });
    g.appendChild(btns);
    $filters.appendChild(g);
  }

  // ── state ──────────────────────────────────────────────────────────────────

  let active = { year: null, tag: null };
  let query  = "";

  function toggleFilter(axis, value) {
    active[axis] = active[axis] === value ? null : value;
    $filters.querySelectorAll(".publication-facet-btn").forEach(btn => {
      btn.classList.toggle(
        "publication-facet-btn--active",
        btn.dataset.axis === axis &&
        btn.dataset.value === value &&
        active[axis] !== null
      );
    });
    const url = new URL(window.location);
    active[axis] ? url.searchParams.set(axis, value)
                 : url.searchParams.delete(axis);
    history.replaceState(null, "", url);
    render();
  }

  if ($search) {
    $search.addEventListener("input", () => {
      query = $search.value.trim();
      render();
    });
  }

  // ── render ─────────────────────────────────────────────────────────────────

  function render() {
    // 1. get matching ids from Fuse (or all if no query)
    const matchingIds = query.length >= 2
      ? new Set(fuse.search(query).map(r => r.item.id))
      : null; // null = all

    // 2. show/hide each <li>
    let visible = 0;
    Object.entries(entriesById).forEach(([id, { li, div }]) => {
      const fuzzyMatch  = !matchingIds || matchingIds.has(id);
      const yearMatch   = !active.year || div.dataset.year === active.year;
      const tagMatch    = !active.tag  ||
        (div.dataset.tags || "").split(",").map(t => t.trim()).includes(active.tag);

      const show = fuzzyMatch && yearMatch && tagMatch;
      li.style.display = show ? "" : "none";
      if (show) visible++;
    });

    // 3. hide year headings whose entire group is hidden
    document.querySelectorAll("h2").forEach(h2 => {
      const ul = h2.nextElementSibling;
      if (!ul || ul.tagName !== "UL") return;
      const anyVisible = Array.from(ul.querySelectorAll("li"))
        .some(li => li.style.display !== "none");
      h2.style.display = anyVisible ? "" : "none";
    });

    if ($count) {
      $count.textContent = `${visible} publication${visible !== 1 ? "s" : ""}`;
    }
  }

  // ── restore URL state ──────────────────────────────────────────────────────

  function restoreUrl() {
    const url = new URL(window.location);
    ["year", "tag"].forEach(axis => {
      const v = url.searchParams.get(axis);
      if (v) {
        active[axis] = v;
        const btn = $filters.querySelector(
          `.publication-facet-btn[data-axis="${axis}"][data-value="${CSS.escape(v)}"]`
        );
        if (btn) btn.classList.add("publication-facet-btn--active");
      }
    });
  }

  restoreUrl();
  render();

})();
