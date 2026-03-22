---
title: Architecture
description: Current system architecture and request flow of Baumbart.
---

Baumbart is a LangGraph-driven chatbot runtime that delegates structured
question answering to a Qanary pipeline and reads the resulting annotations
and answers from a triplestore.

![System Architecture](@assets/architecture-graph.png)

The diagram is a simplified map of the system. The current implementation is
defined by the package boundaries, graph nodes, and integration flows
described below.

## Main Building Blocks

- `apps/chatui` is the web entrypoint. It restores or creates a chat session,
  exposes the initial message history, and runs the websocket boundary used for
  live chat messages and metadata updates.
- `packages/chatbot` contains the conversation engine. It builds the LangGraph
  state machine, tracks the agent state, emits progress metadata, rewrites
  questions, and decides whether the next step is answer generation or a
  clarification question.
- The Qanary components implement the structured question-answering pipeline.
  In the current setup they classify the expected answer type, extract entities,
  disambiguate matches, detect the relation, and generate a SPARQL query.
- The triplestore is the shared storage boundary between the Qanary pipeline
  and the chatbot runtime. Qanary writes annotations into a named graph, and
  the chatbot later reads the final answer and clarification annotations back
  from that graph.
- The LLM layer is used around the structured pipeline, not instead of it. It
  rewrites follow-up questions, phrases clarification prompts, and turns the
  structured Qanary result into a natural-language answer.

## Conversation Flow

1. `apps/chatui` loads or creates an in-memory session state and opens the
   websocket connection used for the conversation.
2. `packages/chatbot` starts the LangGraph runtime from the current agent state
   and waits for the next user input.
3. The router evaluates the current `chatmode` and sends new user questions
   into the question-answering path.
4. The question rewrite node consolidates the existing conversation history and
   the latest user input into one self-contained question.
5. The Qanary orchestrator calls the Qanary API with a fixed component list:
   expected answer type, named entity recognition, disambiguation, relation
   detection, and SPARQL generation.
6. The Qanary pipeline writes its annotations and answer data into a named
   graph in the triplestore.
7. The chatbot runtime reads the final answer annotation and any clarification
   annotations from that graph.
8. The router either sends the conversation to clarification generation or to
   final response generation, then returns to waiting for the next user input.

## Clarification Loop

Baumbart models the conversation with three high-level chat modes:

- `USER_QUESTION` collects a new user request.
- `RESPONSE` means the system is preparing or delivering a response.
- `CLARIFICATION` means the system has open clarification questions backed by
  Qanary annotations.

When the chatbot reads clarification annotations from the triplestore, it
builds a clarification conversation and switches into `CLARIFICATION`.
`RequestClarificationNode` asks the next open clarification question using the
LLM layer, while `UserInputNode` stores the answer against the current
clarification item.

Once all clarification questions have been answered, the router switches back
to the question-answering path. The question rewrite node then reissues the
enriched user request so the Qanary pipeline can run again with the new
context.

## Qanary Pipeline

The chatbot currently invokes Qanary with a fixed component order:

1. Expected answer type
2. Named entity recognition
3. Disambiguation
4. Relation detection
5. SPARQL generation

This sequence produces the annotations that later drive response generation and
clarification handling.

## Data and Integration Boundaries

- Websocket traffic between `apps/chatui` and the chatbot runtime carries both
  chat messages and metadata events such as `WAITING_FOR_INPUT`,
  `GATHERING_DATA`, and `GENERATING_RESPONSE`.
- Chatbot state is stored in memory per session in the current implementation.
  Session IDs are cookie-backed, but the actual state lives in a process-local
  map inside the chat UI server.
- The chatbot does not receive the final end-user answer directly from Qanary.
  The Qanary API returns a graph URI, which the chatbot then uses to read the
  relevant annotations from the triplestore.
- The triplestore is the main handoff boundary between the chatbot and the
  Qanary pipeline. It stores both final answer annotations and clarification
  annotations for the current question graph.
- OpenRouter-backed LLM calls are used only for question rewriting,
  clarification phrasing, and final answer phrasing around the structured data
  returned by Qanary.

These boundaries are the main integration points contributors need to
understand when changing runtime behavior.

## Current Constraints

- Chat session state is process-local and in-memory, so it is not shared across
  multiple server instances and does not survive a process restart.
- The list of Qanary components is fixed in `packages/chatbot` rather than
  being configured dynamically per request.
- Qanary API access, triplestore access, and LLM access are runtime
  dependencies provided through environment configuration.

## See Also

- [Qanary Annotations](/docs/reference/annotations/)
- [Example Dialogues](/docs/reference/dialogues/)
- [chatbot/index](/docs/reference/source-code/chatbot/)
- [chatbot/graph](/docs/reference/source-code/chatbot/graph/)
- [chatbot/nodes](/docs/reference/source-code/chatbot/nodes/)
- [chatui/lib/server/chat-session](/docs/reference/source-code/chatui/lib/server/chat-session/)
- [chatui/lib/server/chat-websocket](/docs/reference/source-code/chatui/lib/server/chat-websocket/)
