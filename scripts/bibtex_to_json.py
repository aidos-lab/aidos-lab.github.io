"""Convert BibTeX file to JSON."""

import argparse
import collections
import colorlog
import json
import os

import bibtexparser

from bibtexparser.bparser import BibTexParser
from bibtexparser.customization import author
from bibtexparser.customization import convert_to_unicode

from nameparser import HumanName

from titlecase import titlecase


def customizations(record):
    """Customize record parsing."""
    record = convert_to_unicode(record)
    record = author(record)
    return record


def initialize(name, pad=""):
    """Return initial of author name."""
    if name:
        return pad + name[0] + "."
    else:
        return ""


def transform_authors(authors, annotations):
    """Transform authors to nicer format."""
    output = []

    for auth in authors:
        name_parts = auth.split(",")
        name_parts = [n.strip() for n in reversed(name_parts)]

        name_parts = " ".join(name_parts)

        name = HumanName(name_parts)

        name_parts = (
            initialize(name.first)
            + initialize(name.middle, "&thinsp;")
            + "&nbsp;"
            + name.last
        )

        output.append(name_parts)

    if annotations:
        annotations = annotations.split(";")
        for annotation in annotations:
            annotation = annotation.strip()

            index, commands = annotation.split("=")
            index = int(index) - 1
            commands = commands.split(",")

            for command in commands:
                symbol = None
                if command == "first":
                    symbol = "&dagger;"
                elif command == "last":
                    symbol = "&Dagger;"
                elif command == "highlight" and args.highlight:
                    output[index] = "**" + output[index] + "**"

                if symbol is not None:
                    output[index] = output[index] + f"<sup>{symbol}</sup>"

    # Some 'involved' author name handling: add 'and' with Oxford comma
    # as needed.
    if len(output) > 1:
        and_ = " and " if len(output) == 2 else ", and "
        return ", ".join(output[:-1]) + and_ + output[-1]
    else:
        return output[0]


def get_keywords(paper):
    keywords = paper.get("keywords", "")
    keywords = keywords.split(",")
    keywords = [
        kw.strip()
        for kw in keywords
        if kw not in ["TOP-IF", "CORE-A*", "CORE-A"]
    ]

    return keywords


def make_eprint_url(paper):
    """Return URL from paper with `eprint`."""
    url = None
    eprint = paper["eprint"]

    if "archiveprefix" in paper and paper["archiveprefix"] == "arXiv":
        url = f"https://arxiv.org/abs/{eprint}"
    elif "eprinttype" in paper:
        repository = paper["eprinttype"]
        url = f"https://{repository.lower()}.org/content/{eprint}"

    return url


def fix_raw_latex(field):
    """Fix raw LaTeX commands."""
    raw = [
        "\\emph",
        "\\mbox",
        "\\textbf",
        # This is probably due to a bug in the parser; ideally, raw
        # markup should be replaced 'as-is.'
        "\\Texttt",
    ]

    for kw in raw:
        field = field.replace(kw, "")

    # Make sure that double quotes are replaced correctly.
    field = field.replace("``", "&ldquo;")
    field = field.replace("''", "&rdquo;")

    # Replace remaining single quotes and let our Markdown system do the
    # right thing here.
    field = field.replace("`", "'")

    # Non-breaking space handling
    field = field.replace("~", "&nbsp;")

    return field


def make_title(paper):
    """Create title for paper."""

    def _fix_titlecase(word, all_caps=False):
        return word if word == "ECT:" else None

    raw_title = paper["title"]
    raw_title = titlecase(raw_title, callback=_fix_titlecase)
    raw_title = fix_raw_latex(raw_title)

    if "$K$" in raw_title:
        raw_title = raw_title.replace("$K$", "$k$")
    elif "-L-" in raw_title:
        raw_title = raw_title.replace("-L-", "-l-")

    url = None

    if "doi" in paper:
        doi = paper["doi"]
        url = f"https://dx.doi.org/{doi}"
    elif "url" in paper:
        url = paper["url"]
    elif "eprint" in paper:
        url = make_eprint_url(paper)

    return raw_title, url


def to_json(paper):
    """Transform paper to JSON."""
    title, url = make_title(paper)

    result = {
        "title": title,
        "authors": paper.get("author"),
        "authors-display": transform_authors(
            paper["author"], paper.get("author+an", "")
        ),
        "keywords": get_keywords(paper),
    }

    if url is not None:
        result["url"] = url

    venue = ""

    if paper["ENTRYTYPE"] in ["article", "inproceedings", "incollection"]:
        for f in ["journal", "booktitle"]:
            if f in paper:
                c = fix_raw_latex(paper[f])
                venue += c

        if volume := paper.get("volume", None):
            venue += f", Volume {volume}"

        if number := paper.get("number", None):
            venue += f", Number {number}"

        if pages := paper.get("pages", None):
            venue += f", pp. {pages}"

    elif paper["ENTRYTYPE"] == "mastersthesis":
        venue += "M.Sc. thesis"
        venue += ", " + paper.get("school")

    elif paper["ENTRYTYPE"] == "phdthesis":
        venue += "Ph.D. thesis"
        venue += ", " + paper.get("school")

    elif paper["ENTRYTYPE"] == "unpublished":
        if "type" in paper:
            if "preprint" not in paper["type"].lower():
                return None

        venue += "Preprint"

    else:
        logger.warning(f'Did not handle paper "{paper}"')

    result["venue"] = venue
    result["year"] = paper["year"]

    if "eprint" in paper:
        if (url := make_eprint_url(paper)) is not None:
            result["preprint"] = url

    # Add an author's copy to the publication if available.
    if "url" in paper and "doi" in paper:
        result["author-copy"] = paper["url"]

    if "repository" in paper:
        result["repository"] = paper["repository"]

    result["id"] = paper["ID"]

    if "note" in paper:
        result["note"] = fix_raw_latex(paper["note"])

    return result


def export_entry(entry):
    """Export entry to `.bib` file in `/tmp`."""
    from bibtexparser.bibdatabase import BibDatabase
    from bibtexparser.bwriter import BibTexWriter

    db = BibDatabase()
    db.entries = [entry]

    writer = BibTexWriter()
    writer.indent = "\t"
    writer.add_trailing_comma = True
    writer.common_strings = True

    filename = os.path.join("/tmp", entry["ID"] + ".bib")
    with open(filename, "w") as f:
        f.write(writer.write(db))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--highlight",
        action="store_true",
        help="If set, use highlighting directive in BibTeX if present",
    )

    parser.add_argument("FILE", type=str, help="Input file")

    args = parser.parse_args()

    handler = colorlog.StreamHandler()
    handler.setFormatter(
        colorlog.ColoredFormatter("%(log_color)s%(levelname)s: %(message)s")
    )

    logger = colorlog.getLogger()
    logger.addHandler(handler)

    parser = BibTexParser(common_strings=True, customization=customizations)

    with open(args.FILE) as f:
        db = bibtexparser.load(f, parser=parser)

    # Get raw database without any customizations, so that we can store
    # the original variant of every entry again.
    with open(args.FILE) as f:
        raw_parser = BibTexParser(common_strings=True)
        raw_db = bibtexparser.load(f, parser=raw_parser)

    coauthors = collections.Counter()

    papers = [e for e in db.entries if "author" in e]

    # Assume that the sorting order in the bibliography is sufficient, i.e.,
    # report papers in reverse order of appearance in the file.
    papers = list(reversed(papers))
    exported_entries = set()
    data = []

    for i, p in enumerate(papers):
        if (result := to_json(p)) is not None:
            result["order"] = i
            exported_entries.add(p["ID"])
            data.append(result)

    print(json.dumps(data, indent=4))

    # Read file *again* (but this time, without any customizations) in order
    # to export all valid entries to '/tmp'.

    parser = BibTexParser(common_strings=True)

    with open(args.FILE) as f:
        db = bibtexparser.load(f, parser=parser)

    for entry in db.entries:
        if entry["ID"] in exported_entries:
            export_entry(entry)
