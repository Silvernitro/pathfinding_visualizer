
class Graph {
    constructor() {
        this.nodes = [];
        this.adjList = {};
    }

    addNode(node) {
        this.nodes.push(node);
        this.adjList[node] = [];
    }

    addEdge(node1, node2, weight) {
        this.adjList[node1].push({node:node2, weight:weight});
        this.adjList[node2].push({node:node1, weight:weight});
    }

    shortestPath(startNode, endNode) {
        let times = {};
        let backtrace = {};
        let pq = [];

        times[startNode] = 0;
        this.nodes.forEach(node => {
            if (node !== startNode) {
                times[node] = Infinity;
            }
        });

        pq.push([startNode, 0]);
        while (pq.length !== 0) {
            pq.sort();
            let currentNode = pq.shift()[0];
            this.adjList[currentNode].forEach(neighbor => {
                let time = times[currentNode] + neighbor.weight;
                if (time < times[neighbor.node]) {
                    times[neighbor.node] = time;
                    backtrace[neighbor.node] = currentNode;
                    pq.push([neighbor.node, time]);
                }
            });


        }

        let path = [endNode];
        let lastVisited = endNode;
        while (lastVisited !== startNode) {
            path.unshift(backtrace[lastVisited]);
            lastVisited = backtrace[lastVisited];
        }
        console.log(path);

    }
}

const testGraph = new Graph();
const test = [[0,1,2], [3,4,5], [6,7,8]];

for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        testGraph.addNode(test[i][j]);
        try {
            test[i-1][j] !== undefined ? testGraph.addEdge(test[i-1][j],
                test[i][j], 1) : null;
        } catch(error) {}
        try {
            test[i][j-1] !== undefined ? testGraph.addEdge(test[i][j-1],
                test[i][j], 1) : null;
        } catch(error) {}
        try {
            test[i][j+1] !== undefined ? testGraph.addEdge(test[i][j+1],
                test[i][j], 1) : null;
        } catch(error) {}
        try {
            test[i+1][j] !== undefined ? testGraph.addEdge(test[i+1][j],
                test[i][j], 1) : null;
        } catch(error) {}
    }
}

console.log(testGraph.nodes);
console.log(testGraph.adjList);
testGraph.shortestPath(0,8);
