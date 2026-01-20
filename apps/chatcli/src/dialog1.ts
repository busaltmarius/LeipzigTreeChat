import { START, END, StateGraph, Annotation } from "@langchain/langgraph";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({ input, output });


const AgentState = Annotation.Root({
});

const N1 = "ask_watered_amount";
async function ask_watered_amount(state: typeof AgentState.State) {
    const a1 = await rl.question("ChatBot: Im Zeitraum 2021-2024 wurden XY Liter gegossen. Willst du die Liter für ein bestimmtes Jahr wissen?\n");
    console.info("Received:", a1);
    return state;
}

const N2 = "watered_amount_list";
async function watered_amount_list(state: typeof AgentState.State) {
    const a2 = await rl.question(
        "ChatBot: ### Liste der gegossenen Menge pro Jahr###?\n",
    );
    console.info("Received:", a2);
    return state;
}

const graph = new StateGraph(AgentState)
    .addNode(N1, ask_watered_amount)
    .addNode(N2, watered_amount_list)
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
