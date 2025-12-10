This project is built with bun. You need to install bun first (MAC OS / Linux):

```bash
curl -fsSL https://bun.com/install | bash
```

Then run `bun install` and execute `bun src/ai/media/stt/stt.ts`.

For testing convenience, I've designed a pushTalk mechanism to avoid echo caused by input and output sharing the same microphone. Press space to start speaking.

To simulate RAG, the project includes `qa.json` (website FAQ) and `qa-embeddings.json`. Retrieval uses `qa-embeddings.json` as the retrieval source and calculates query similarity. Please copy `env.example` from the email to the project and rename it to `.env`.

`QWEN_ASR_LANGUAGE` specifies the language for ASR to receive. It can be left empty, but specifying it will yield better results.

English generally performs better and is more stable than German. You can test both.

The current implementation is still rough and has limited stability. Please test multiple times. Test output can be found in `test.txt`.

The code is located in `src/ai/llm`, `src/ai/media`, and `src/ai/rag`.
