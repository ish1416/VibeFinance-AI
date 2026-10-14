"""
BM25 (Best Matching 25) ranker implementation in pure Python.
Optimized for corporate filings retrieval and exact keyword matches.
"""

import math
import re


def tokenize(text: str) -> list[str]:
    """Tokenize lowercase alphanumeric words with length > 2."""
    if not text:
        return []
    return [w for w in re.findall(r"\b[a-zA-Z0-9_\.]+\b", text.lower()) if len(w) > 1]


class BM25Okapi:
    def __init__(self, corpus: list[dict], k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.corpus = corpus
        self.doc_len = []
        self.doc_freqs = []
        self.nd = len(corpus)
        self.avgdl = 0.0
        self.idf = {}

        total_length = 0
        for doc in corpus:
            text = f"{doc.get('documentName', '')} {doc.get('highlightQuote', '')} {doc.get('fullExcerpt', '')} {doc.get('category', '')}"
            tokens = tokenize(text)
            self.doc_len.append(len(tokens))
            total_length += len(tokens)

            freqs = {}
            for t in tokens:
                freqs[t] = freqs.get(t, 0) + 1
            self.doc_freqs.append(freqs)

            for term in freqs.keys():
                self.idf[term] = self.idf.get(term, 0) + 1

        self.avgdl = total_length / self.nd if self.nd > 0 else 1.0

        # Calculate standard inverse document frequency
        for term, freq in self.idf.items():
            self.idf[term] = math.log((self.nd - freq + 0.5) / (freq + 0.5) + 1.0)

    def score(self, query: str) -> list[tuple[float, dict]]:
        query_tokens = tokenize(query)
        scores = []

        for idx, doc in enumerate(self.corpus):
            doc_score = 0.0
            doc_len = self.doc_len[idx]
            freqs = self.doc_freqs[idx]

            for term in query_tokens:
                if term not in freqs:
                    continue
                tf = freqs[term]
                idf = self.idf.get(term, 0.0)
                denom = tf + self.k1 * (1.0 - self.b + self.b * (doc_len / self.avgdl))
                doc_score += idf * (tf * (self.k1 + 1.0) / denom)

            scores.append((doc_score, doc))

        scores.sort(key=lambda x: x[0], reverse=True)
        return scores
