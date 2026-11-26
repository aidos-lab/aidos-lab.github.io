/**
 * publications.js
 *
 * Fuzzy search (Fuse.js) over the visible text of each publication, plus a
 * year filter. Shows/hides the existing <li> elements.
 *
 * Expected DOM:
 *   <input id="publication-search">
 *   <div   id="publication-filters">
 *   <p     id="publication-count">
 *   <li><div class="publication" data-year="..." data-authors="Last, First; ...">...</div></li>
 */

(function () {
  "use strict";

  const entries = [...document.querySelectorAll("div.publication")].map(div => ({
    li:   div.closest("li"),
    year: div.dataset.year,
    text: div.textContent.replace(/\s+/g, " ").trim() + " " +
          // full author names, "Last, First" → "First Last"
          div.dataset.authors.split("; ").map(a => a.split(", ").reverse().join(" ")).join(", "),
  }));

  if (!entries.length) return;

  const fuse = new Fuse(entries, {
    keys: ["text"],
    ignoreLocation: true,
    threshold: 0.35,
    minMatchCharLength: 2,
  });

  const $search  = document.getElementById("publication-search");
  const $filters = document.getElementById("publication-filters");
  const $count   = document.getElementById("publication-count");

  // ── state ──────────────────────────────────────────────────────────────────

  let activeYear = new URL(window.location).searchParams.get("year");
  let query      = "";

  // ── year buttons ───────────────────────────────────────────────────────────

  const years = [...new Set(entries.map(e => e.year))].sort((a, b) => b - a);

  years.forEach(year => {
    const btn = document.createElement("button");
    btn.type        = "button";
    btn.className   = "publication-facet-btn";
    btn.textContent = year;
    btn.addEventListener("click", () => setYear(activeYear === year ? null : year));
    $filters.appendChild(btn);
  });

  function setYear(year) {
    activeYear = year;
    $filters.querySelectorAll(".publication-facet-btn").forEach(btn => {
      btn.classList.toggle("publication-facet-btn--active", btn.textContent === year);
    });
    const url = new URL(window.location);
    year ? url.searchParams.set("year", year) : url.searchParams.delete("year");
    history.replaceState(null, "", url);
    render();
  }

  $search.addEventListener("input", () => {
    query = $search.value.trim();
    render();
  });

  // ── render ─────────────────────────────────────────────────────────────────

  function render() {
    const matches = query.length >= 2
      ? new Set(fuse.search(query).map(r => r.item))
      : null; // null = all

    let visible = 0;
    entries.forEach(e => {
      const show = (!matches || matches.has(e)) && (!activeYear || e.year === activeYear);
      e.li.style.display = show ? "" : "none";
      if (show) visible++;
    });

    // hide year headings whose entire group is hidden
    document.querySelectorAll(".publications h2").forEach(h2 => {
      const anyVisible = [...h2.nextElementSibling.querySelectorAll("li")]
        .some(li => li.style.display !== "none");
      h2.style.display = anyVisible ? "" : "none";
    });

    $count.textContent = `${visible} publication${visible !== 1 ? "s" : ""}`;
  }

  setYear(activeYear);

})();
