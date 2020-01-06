
export class Graph {
    constructor() {
        // nodes are objects with 4 key-value pairs: name, row, col, isWall
        this.nodes = [];
        this.adjList = {};
    }

    addNode(node) {
        this.nodes.push(node);
        this.adjList[node.name] = [];
    }

    addEdge(node1, node2, weight) {
        this.adjList[node1.name].push({node:node2, weight:weight});
        this.adjList[node2.name].push({node:node1, weight:weight});
    }

    shortestPath(startNode, endNode) {
        let times = {};
        let backtrace = {};
        let pq = [];
        const visited = [];

        times[startNode.name] = 0;
        this.nodes.forEach(node => {
            if (node.name !== startNode.name) {
                times[node.name] = Infinity;
            }
        });

        pq.push([startNode, 0]);
        while (pq.length !== 0) {
            pq.sort((a,b) => (a[1] > b[1]) ? 1
                                           : (b[1] > a[1])
                                                ? -1 
                                                : 0);
            let currentNode = pq.shift()[0];
            if (currentNode.isWall) {

            } else {
                visited.push(currentNode.name);
                if (currentNode.name === endNode.name) {
                    break;
                } else {
                    this.adjList[currentNode.name].forEach(neighbor => {
                        let time = times[currentNode.name] + neighbor.weight;
                        if (time < times[neighbor.node.name]) {
                            times[neighbor.node.name] = time;
                            backtrace[neighbor.node.name] = currentNode.name;
                            pq.push([neighbor.node, time]);
                        }
                    });
                }
            }

        }

        let path = [endNode.name];
        let lastVisited = endNode.name;
        while (lastVisited !== startNode.name) {
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





