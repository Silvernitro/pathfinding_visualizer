
export class Graph {
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
        const visited = [];

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
            visited.push(currentNode);
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
        return [path, visited];

    }

    gridtoGraph(grid) {
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid.length; j++) {
                this.addNode(grid[i][j]);
                try {
                    if (grid[i-1][j] !== undefined) {this.addEdge(grid[i-1][j], grid[i][j], 1);}
                } catch(error) {}
                try {
                    if (grid[i][j-1] !== undefined) {this.addEdge(grid[i][j-1], grid[i][j], 1);}
                } catch(error) {}
                try {
                    if (grid[i][j+1] !== undefined) {this.addEdge(grid[i][j+1], grid[i][j], 1);}
                } catch(error) {}
                try {
                    if(grid[i+1][j] !== undefined) {this.addEdge(grid[i+1][j], grid[i][j], 1);}
                } catch(error) {}
            }
        }
    }
    
}

// const grid = [[0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]];
// const graph = new Graph();
// graph.gridtoGraph(grid);
// graph.shortestPath(0,11);



