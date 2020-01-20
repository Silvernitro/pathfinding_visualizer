import React from "react";
import "./App.css";
import { Graph } from "./Graph.js";
import { make_random_grid } from "./random_walls.js";

class Grid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      grid: [],
      start: {},
      end: {},
      phase: 1,
      gridState: "normal",
      mouseOverState: "normal",
      weightValue: 1,
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleLongPress = this.handleLongPress.bind(this);
    this.handlePressRelease = this.handlePressRelease.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.resetGrid = this.resetGrid.bind(this);
  }

  componentDidMount() {
    const copygrid = [];
    let counter = 0;
    for (let i = 0; i < 25; i++) {
      copygrid[i] = [];
      for (let j = 0; j < 35; j++) {
        copygrid[i][j] = {
          name: counter,
          isWall: false,
          isStart: false,
          isEnd: false,
          weight: 1,
          row: i,
          col: j
        };
        counter++;
      }
    }
    this.setState({
      grid: copygrid
    });
  }

  handleChange(event) {
    // method to handle pressing of buttons. (only add wall button currently)
    const { name, value } = event.target;
    if (name === "addingWalls" || name === "addingWeights" || name === "eraseButton") {
      this.setState(prev => ({
        gridState: prev.gridState === name ? "normal" : name,
        mouseOverState: "normal"
      }))
    } else if (name === "resetButton") {
      this.resetGrid();
    } else if (name === "weightSelector") {
      this.setState({
        weightValue: parseInt(value)
      });
    } else if (name === "randomButton") {
      this.setState({
        grid: make_random_grid(this.state.start.name, this.state.end.name)
      });
    }
  }

  handleLongPress(event) {
    event.preventDefault();
    if (this.state.gridState === "addingWalls") {
      this.setState({ mouseOverState: "drawingWalls" });
    } else if (this.state.gridState === "addingWeights") {
      this.setState({ mouseOverState: "drawingWeights" });
    } else if (this.state.gridState === "eraseButton") {
      this.setState({ mouseOverState: "erasing" });
    }
  }

  handlePressRelease() {
    this.setState({
      mouseOverState: "normal"
    })
  }

  handleMouseOver(event) {
    event.preventDefault();
    return event_element => {
      const copied = this.state.grid.slice();
      if (this.state.mouseOverState === "drawingWalls") {
        copied[event_element.row][event_element.col].isWall = true;
      } else if (this.state.mouseOverState === "drawingWeights") {
        copied[event_element.row][
          event_element.col
        ].weight = this.state.weightValue;
      } else if (this.state.mouseOverState === "erasing") {
        copied[event_element.row][event_element.col].weight = 1;
        copied[event_element.row][event_element.col].isWall = false;
      }

      this.setState({
        grid: copied
      });
    };
  }

  handleClick(key) {
    if (this.state.gridState === "addingWalls") {
      /*  If the user is in "Add Walls" mode, allow the user to paint
       *  individual nodes by clicking on them.
       */
      const copied = this.state.grid.slice();
      copied[key.row][key.col].isWall = true;
      this.setState({ grid: copied });
    } else if (this.state.gridState === "addingWeights") {
      const copied = this.state.grid.slice();
      copied[key.row][key.col].weight = this.state.weightValue;
      this.setState({ grid: copied });
    } else if (this.state.gridState === "eraseButton") {
      const copied = this.state.grid.slice();
      copied[key.row][key.col].weight = 1;
      copied[key.row][key.col].isWall = false;
      this.setState({ grid: copied });
    } else {
      /* Else, the user is trying to select a start/end node, or ready to start
       * the search algorithm.
       */
      if (this.state.phase === 1) {
        // set the starting node
        const copied = this.state.grid.slice();
        copied[key.row][key.col].isStart = true;
        this.setState({
          grid: copied,
          start: copied[key.row][key.col],
          phase: 2
        });
      } else if (this.state.phase === 2) {
        // set the end node
        const copied = this.state.grid.slice();
        copied[key.row][key.col].isEnd = true;
        this.setState({
          grid: copied,
          end: copied[key.row][key.col],
          phase: 3
        });
      } else {
        // start Dijkstra's Algorithm
        if (!this.state.addingWalls) {
          const graph = new Graph();
          graph.gridtoGraph(this.state.grid);
          const result = graph.shortestPath(this.state.start, this.state.end);
          if (!result[0].length) {
            const noPath = new Promise((resolve, reject) => {
              resolve(this.animate(result));
              reject("error");
            });
            noPath.then(
              success => {
                if (success) {
                  this.setState({
                    phase: 4
                  });
                }
              },
              failure => {
                console.log(failure);
              }
            );
          }

          // render the search animation
          this.animate(result);
        } else {
        }
      }
    }
  }

  resetGrid() {
    /*  This function resets the entire state of the search grid and algorithm.
     *  It is called when the user presses the reset button
     */

    // Create a new empty grid as in ComponentDidMount
    const copygrid = [];
    let counter = 0;
    for (let i = 0; i < 25; i++) {
      copygrid[i] = [];
      for (let j = 0; j < 35; j++) {
        copygrid[i][j] = {
          name: counter,
          isWall: false,
          row: i,
          col: j,
          weight: 1
        };
        resetNodeClass(counter);
        counter++;
      }
    }

    function resetNodeClass(value) {
      // This function resets the class of the give node (by id) to .Node
      // It is used to un-color colored nodes.
      var node_div = document.getElementById(value);
      node_div.className = "Node";
    }

    // Stop all animations
    var id = window.setTimeout(function() {}, 0);

    // This hack works bc timer IDs are consecutive integers. So we just need
    // to get the latest timer id and decrement from it to get all timers.
    while (id--) {
      window.clearTimeout(id);
    }

    // Reset the reset of the grid state
    this.setState({
      grid: copygrid,
      phase: 1,
      start: {},
      end: {},
      gridState: "normal",
      mouseOverState: "normal",
      weightValue: 1
    });
  }

  animate(result) {
    /* This is the main animation function.
     * It animates both the search path and result path found by Dijkstra's
     * Algo.
     */

    /* @param {Array.<number[]>} an array where idx=0 is the search path and
     *  idx=1 is the result path.
     *
     * @return {undefined} this function does not return a value
     */
    const search_path = result[1];
    const result_path = result[0];

    // function wait is a promise wrapper for setTimeout.
    // it has the same functionality as setTimeout, but also returns a promise.
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    // Array to store promises returned from animating the
    // search path
    const promise_array = [];

    function animate_search(idx) {
      //  Animates the search path that Dijkstra's Algo takes.
      /*  @param {number} The current index of the search_path array being
       *  animated.
       *  @returns {undefined} This function does not return any value
       */

      var node_div = document.getElementById(search_path[idx]);
      if (node_div.className !== "Start" && node_div.className !== "End") {
        node_div.className = "Visited";
      } else {
      }
    }

    function animate_result() {
      //  Animates the result path found by Dijkstra's Algo.

      for (let i = 0; i < result_path.length; i++) {
        setTimeout(() => {
          var node_div = document.getElementById(result_path[i]);
          if (node_div.className === "Start" || node_div.className === "End") {
          } else {
            node_div.className = "Path";
          }
        }, 50 * i);
      }
    }

    // start animating the search path
    for (let i = 0; i < search_path.length; i++) {
      promise_array.push(wait(10 * i).then(() => animate_search(i)));
    }

    // After validating that all promises have been fulfilled (which means we
    // are done animating the search path), start animating the result path
    return Promise.all(promise_array)
      .then(animate_result)
      .then(() => true);
  }

  render() {
    const rows = this.state.grid.map(row => (
      <div className="RowContainer">
        {row.map(element => (
          <Node
            key={element.name}
            element={element}
            onClick={this.handleClick}
            onMouseDown={this.handleLongPress}
            onMouseUp={this.handlePressRelease}
            onMouseOver={this.handleMouseOver}
          />
        ))}
      </div>
    ));

    return (
      <div className="GameContainer">
        <StatusTitle
          addingWalls={this.state.addingWalls}
          addingWeights={this.state.addingWeights}
          phase={this.state.phase}
        />
        {rows}
        <Options
          addingWalls={this.state.gridState === "addingWalls"}
          onChange={this.handleChange}
          addingWeights={this.state.gridState === "addingWeights"}
          isErasing={this.state.gridState === "eraseButton"}
        />
      </div>
    );
  }
}

class Node extends React.Component {
  render() {
    let node_state;

    if (this.props.element.isStart) {
      node_state = "Start";
    } else if (this.props.element.isEnd) {
      node_state = "End";
    } else if (this.props.element.isWall) {
      node_state = "Wall";
    } else {
      node_state = "Node";
    }

    return (
      <div
        className={node_state}
        onClick={() => this.props.onClick(this.props.element)}
        id={this.props.element.name}
        onMouseDown={this.props.onMouseDown}
        onMouseUp={this.props.onMouseUp}
        onMouseOver={event => this.props.onMouseOver(event)(this.props.element)}
      >
        {this.props.element.weight > 1 &&
        !this.props.element.isEnd &&
        !this.props.element.isStart ? (
          <span> {this.props.element.weight} </span>
        ) : (
          <span className="HideThis"> 1 </span>
        )}
      </div>
    );
  }
}

function Options(props) {
  return (
    <div>
      <button onClick={props.onChange} name="addingWalls">
        {props.addingWalls ? "Done" : "Add Walls"}
      </button>
      <button onClick={props.onChange} name="resetButton">
        Reset
      </button>
      <button onClick={props.onChange} name="eraseButton">
        {props.isErasing ? "Done" : "Erase"}
      </button>
      <button onClick={props.onChange} name="addingWeights">
        {props.addingWeights ? "Done" : "Add Weights"}
      </button>
      {props.addingWeights ? (
        <select onChange={props.onChange} name="weightSelector">
          <option value="1"> 1 </option>
          <option value="2"> 2 </option>
          <option value="3"> 3 </option>
          <option value="4"> 4 </option>
        </select>
      ) : null}
      <button onClick={props.onChange} name="randomButton">
        Randomize walls
      </button>
    </div>
  );
}

function StatusTitle(props) {
  /*  This component displays the current phase to the user.
   *  The user can either be choosing a start node, end node, drawing walls, or
   *  be prompted to start the algorithm.
   *
   *  { StatusTitle.props.addingWalls } Predicate to check if user is drawing
   *  walls.
   *
   *  { StatusTitle.props.phase } Number to track whether the user is setting
   *  start/end nodes or ready to start the algorithm.
   */

  let title_string;

  if (props.addingWalls) {
    title_string = "Click and hold to draw walls on the grid";
  } else if (props.addingWeights) {
    title_string = "Click and hold to add weights on the grid";
  } else if (props.phase === 1) {
    title_string = "Click to choose the starting node";
  } else if (props.phase === 2) {
    title_string = "Click to choose the end node";
  } else if (props.phase === 4) {
    title_string = "No path found!";
  } else {
    title_string = "Click anywhere on the grid to start the search algorithm";
  }

  return <h1 className="StatusTitle">{title_string}</h1>;
}

export default Grid;
