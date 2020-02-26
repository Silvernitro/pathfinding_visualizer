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
    // an edge is an object with a node and weight property.
    //this.adjList[node1.name].push({ node: node2, weight: weight });
    this.adjList[node2.name].push({ node: node1, weight: weight });
  }

  shortestPath(startNode, endNode) {
    // keep track of the shortest total distance from start to each node
    let times = {};
    // keeps track of the paths found
    let backtrace = {};
    // a priority queue of nodes and their distances
    let pq = [];
    // an array of nodes we have visited
    const visited = [];

    // initialize the start node as having 0 distance
    times[startNode.name] = 0;

    // all other nodes are initially infinitely far away
    this.nodes.forEach(node => {
      if (node.name !== startNode.name) {
        times[node.name] = Infinity;
      }
    });

    pq.push([startNode, 0]);
    while (pq.length !== 0) {
      pq.sort((a, b) => (a[1] > b[1] ? 1 : b[1] > a[1] ? -1 : 0));

      // get the closest node
      let current = pq.shift();
      let currentNode = current[0];

      if (currentNode.isWall) {
      } else {
        // visit this closest node
        visited.push(currentNode.name);
        if (currentNode.name === endNode.name) {
          // we've reached the end
          break;
        } else {
          // conduct edge relaxation on all neighbors
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
    // if time to endNode is calculated as infinity, then no path exists from start node to end node
    // hence path is an returned as an empty array
    if (times[endNode.name] === Infinity) {
      return [[], visited];
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
      for (let j = 0; j < grid[0].length; j++) {
        let weight = grid[i][j].weight;
        this.addNode(grid[i][j]);
        try {
          if (grid[i - 1][j] !== undefined) {
            this.addEdge(grid[i - 1][j], grid[i][j], weight);
          }
        } catch (error) {}
        try {
          if (grid[i][j - 1] !== undefined) {
            this.addEdge(grid[i][j - 1], grid[i][j], weight);
          }
        } catch (error) {}
        try {
          if (grid[i][j + 1] !== undefined) {
            this.addEdge(grid[i][j + 1], grid[i][j], weight);
          }
        } catch (error) {}
        try {
          if (grid[i + 1][j] !== undefined) {
            this.addEdge(grid[i + 1][j], grid[i][j], weight);
          }
        } catch (error) {}
      }
    }
  }
}
