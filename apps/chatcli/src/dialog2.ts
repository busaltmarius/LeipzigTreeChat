import { START, END, StateGraph, Annotation } from "@langchain/langgraph";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({ input, output });


const AgentState = Annotation.Root({
});

const N1 = "ask_water_places";
async function ask_water_places(state: typeof AgentState.State) {
  const a1 = await rl.question("ChatBot: Es gibt in einem Umkreis von 500 Metern 42 Wasserentnahmestellen. Die nächstgelegenste Wasserentnahmestelle liegt in der Karl-Liebknecht-Straße 69, 04277 Leipig. Soll ich alle 42 Wasserentnahmestellen auflisten?\n");
  console.info("Received:", a1);
  return state;
}

const N2 = "water_places_list";
async function water_places_list(state: typeof AgentState.State) {
  const a2 = await rl.question(
    "ChatBot: ### Liste der nächsten 50 Wasserentnahmestellen ###?\n",
  );
  console.info("Received:", a2);
  return state;
}

const graph = new StateGraph(AgentState)
  .addNode(N1, ask_water_places)
  .addNode(N2, water_places_list)
  .addEdge(START, N1)
  .addEdge(N1, N2)
  .addEdge(N2, END);

const app = graph.compile();

(async () => {
  const result = await app.invoke({
    output: []
  });
  console.log("Final:", result);
  rl.close();
  process.exit(0);
})();