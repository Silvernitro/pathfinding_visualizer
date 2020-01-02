import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import {Graph} from './Graph.js'

class Grid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      grid: [],
      start: null,
      end: null,
      visitedNodes: null,
      path: [],
      phase: 1,
      foundPath: []
    }
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    const copygrid = [];
    let counter = 0;
    for(let i = 0; i < 20; i++) {
      copygrid[i] = [];
      for (let j = 0; j < 20; j++) {
        copygrid[i][j] = counter;
        counter++;
      }
    }
    this.setState({
      grid: copygrid,
    });
  }


  onClick(key) {
    if (this.state.phase === 1) {
      this.setState({ start: key, phase: 2});
    } else if (this.state.phase === 2) {
      this.setState({ end: key, phase: 3});
    } else {
      if (this.state.start !== null && this.state.end !== null) {
        const graph = new Graph();
        graph.gridtoGraph(this.state.grid);
        const result = graph.shortestPath(this.state.start, this.state.end);
        this.setState({
          path: result[0],
          visitedNodes: result[1]
        });
        this.animatePath(result[0]);
      } else {}
    }
  }

  animatePath(path) {
    for (let i = 0; i < path.length; i++) {
      setTimeout( () => {
        var node_div = document.getElementById(path[i]);
        if (node_div.className === "Start" || node_div.className === "End") {
        } else {
          node_div.className = "Path";
        }
      }, 50 * i);
    }
  }k

  render() {
    const rows = this.state.grid.map((row) =>
      <div className="RowContainer">
        { row.map( (element) => <Node
            key={element}
            name={element}
            isStart={this.state.start === element}
            isEnd={this.state.end === element}
            onClick={ this.onClick }/>) }
      </div>);


    return(
      <div>
        {rows}
      </div>
    )
  }
}

class Node extends React.Component {
  render () {
    let node_state;

    if (this.props.isStart) {
      node_state = "Start";
    } else if (this.props.isEnd) {
      node_state = "End";
    } else {
      node_state = "Node";
    }

    return (
      <div className={ node_state }
        onClick={() => this.props.onClick(this.props.name)}
        id={this.props.name}>
      </div>
    )
  }
}



export default Grid;
