"""
Hybrid Retrieval Engine: Reciprocal Rank Fusion (BM25 + Semantic Vector Embeddings).
Evaluates Hit-Rate@5 over SEBI corporate filings corpus.
"""

from server.data.corpus import RAG_CORPUS, flatten_corpus
from server.rag.bm25 import BM25Okapi
from server.rag.embeddings import MiniLMEmbedder, cosine_similarity


class HybridRetriever:
    def __init__(self, corpus=None):
        self.corpus = corpus or flatten_corpus(RAG_CORPUS)
        self.bm25 = BM25Okapi(self.corpus)
        self.embedder = MiniLMEmbedder()

        # Precompute dense embeddings for each document chunk
        self.doc_embeddings = []
        for doc in self.corpus:
            text = f"{doc.get('documentName', '')} {doc.get('highlightQuote', '')} {doc.get('fullExcerpt', '')} {doc.get('category', '')}"
            self.doc_embeddings.append(self.embedder.encode(text))

    def retrieve(self, query: str, symbol: str = None, top_k: int = 5, bm25_weight: float = 0.4, vector_weight: float = 0.6) -> list[dict]:
        """
        Hybrid search combining BM25 keyword score with dense vector cosine similarity.
        Optionally filters by stock symbol.
        """
        # 1. BM25 scoring
        bm25_results = self.bm25.score(query)
        max_bm25 = max((s for s, _ in bm25_results), default=1.0)
        bm25_map = {}
        for rank, (score, doc) in enumerate(bm25_results):
            norm_score = (score / max_bm25) if max_bm25 > 0 else 0.0
            bm25_map[doc["id"]] = norm_score

        # 2. Vector scoring
        query_vec = self.embedder.encode(query)
        scored_docs = []

        for idx, doc in enumerate(self.corpus):
            if symbol and symbol != "ALL" and doc.get("symbol") != symbol:
                continue

            doc_vec = self.doc_embeddings[idx]
            sim_score = cosine_similarity(query_vec, doc_vec)
            b25_score = bm25_map.get(doc["id"], 0.0)

            # Combined hybrid score
            hybrid_score = round(bm25_weight * b25_score + vector_weight * sim_score, 4)

            scored_docs.append({
                **doc,
                "similarityScore": sim_score,
                "bm25Score": round(b25_score, 4),
                "hybridScore": hybrid_score,
            })

        scored_docs.sort(key=lambda x: x["hybridScore"], reverse=True)
        return scored_docs[:top_k]

    def evaluate_hit_rate(self, top_k: int = 5) -> dict:
        """
        Retrieval evaluation across gold queries verifying Hit-Rate@5.
        """
        benchmark_queries = [
            {"query": "Reliance Jamnagar green energy gigafactory capex", "target_doc": "RIL_EARNINGS_CALL_TRANSCRIPT_Q1"},
            {"query": "Consolidated EBITDA Jio subscriber base ARPU", "target_doc": "RIL_SEBI_Q1_2025_01"},
            {"query": "Infosys Large deal TCV margin revision guidance", "target_doc": "INFY_SEBI_Q1FY25_REG33"},
            {"query": "Infosys client concentration top ten net cash dividend", "target_doc": "INFY_ANNUAL_REPORT_MDA_FY24"},
            {"query": "HDFC Bank Gross NPA Net Interest Margin NIM", "target_doc": "HDFC_SEBI_Q1FY25_01"},
            {"query": "HDFC post merger loan to deposit mortgage disbursement", "target_doc": "HDFC_MERGER_INTEGRATION_NOTE"},
            {"query": "Tata Motors JLR order book Range Rover Defender debt", "target_doc": "TAMO_SEBI_Q1FY25_01"},
            {"query": "Tata Motors Electric vehicle retail bookings curvv platform", "target_doc": "TAMO_EV_BOOKINGS_NOTE"},
        ]

        hits = 0
        total = len(benchmark_queries)
        reciprocal_ranks = []

        for item in benchmark_queries:
            results = self.retrieve(item["query"], top_k=top_k)
            retrieved_ids = [r["id"] for r in results]
            if item["target_doc"] in retrieved_ids:
                hits += 1
                rank = retrieved_ids.index(item["target_doc"]) + 1
                reciprocal_ranks.append(1.0 / rank)
            else:
                reciprocal_ranks.append(0.0)

        hit_rate = round(hits / total, 3)
        mrr = round(sum(reciprocal_ranks) / total, 3)

        return {
            "queries_evaluated": total,
            "hit_rate_at_5": hit_rate,
            "mean_reciprocal_rank_mrr": mrr,
            "status": "PASS" if hit_rate >= 0.85 else "WARN",
        }


# Singleton instance for quick module-level access
retriever = HybridRetriever()
