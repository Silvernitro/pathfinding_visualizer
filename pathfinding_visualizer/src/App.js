import React from "react";
import "./App.css";
import { Graph } from "./Graph.js";
import { make_random_grid } from "./random_walls.js";

/** * The main component to display the grid.  */
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
      weightValue: 1
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleLongPress = this.handleLongPress.bind(this);
    this.handlePressRelease = this.handlePressRelease.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.resetGrid = this.resetGrid.bind(this);
  }

  /**
   * Initialize an empty grid of nodes when component mounts.
   */
  componentDidMount() {
    // temporary array to contain the grid
    const copygrid = [];
    let counter = 0;

    for (let i = 0; i < 25; i++) {
      // create an array for each row
      copygrid[i] = [];
      for (let j = 0; j < 35; j++) {
        // create an empty node
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

    // set the empty grid created to be the current state
    this.setState({
      grid: copygrid
    });
  }

  /**
   * Handles events when buttons in the Options component below the grid are clicked.
   * @param {event} event The event fired by the click on button.
   */
  handleChange(event) {
    // get the button that was clicked
    const { name, value } = event.target;

    if (
      name === "addingWalls" ||
      name === "addingWeights" ||
      name === "eraseButton"
    ) {
      // reset the gridState if we are alr in one of these modes. Else change
      // to that mode.
      this.setState(prev => ({
        gridState: prev.gridState === name ? "normal" : name,
        mouseOverState: "normal"
      }));
    } else if (name === "resetButton") {
      this.resetGrid();
    } else if (name === "weightSelector") {
      // weightValue state keeps track of what weight we are curr adding
      this.setState({
        weightValue: parseInt(value)
      });
    } else if (name === "randomButton") {
      // replace the curr grid state with a new randomized grid
      this.setState({
        grid: make_random_grid(this.state.start.name, this.state.end.name)
      });
    }
  }

  /**
   * Handles the activation of "drawing" mode.
   * @param {event} event The longpress event on any node.
   */
  handleLongPress(event) {
    // prevent the default dragging behaviour
    event.preventDefault();

    // update the mouseOver state depending on what we are drawing
    if (this.state.gridState === "addingWalls") {
      this.setState({ mouseOverState: "drawingWalls" });
    } else if (this.state.gridState === "addingWeights") {
      this.setState({ mouseOverState: "drawingWeights" });
    } else if (this.state.gridState === "eraseButton") {
      this.setState({ mouseOverState: "erasing" });
    }
  }

  /**
   * Resets the mouseOver state once we lift the mouse button after drawing
   */
  handlePressRelease() {
    this.setState({
      mouseOverState: "normal"
    });
  }

  /**
   * Draws on the grid as user click and drags.
   * @param {event} event The mouseover event when the cursor enters the div of
   * the node.
   * @returns {function} A function that takes in the Node obj stored in each node.
   */
  handleMouseOver(event) {
    event.preventDefault();

    // We want to update the node obj associated with the div that fired the
    // event.
    return event_element => {
      // make a copy of our current grid state to work on.
      const copied = this.state.grid.slice();

      // check what drawing mode we are in
      if (this.state.mouseOverState === "drawingWalls") {
        // mark the node moused-over as a wall
        copied[event_element.row][event_element.col].isWall = true;
      } else if (this.state.mouseOverState === "drawingWeights") {
        // update the moused-over node's weight
        copied[event_element.row][
          event_element.col
        ].weight = this.state.weightValue;
      } else if (this.state.mouseOverState === "erasing") {
        // reset both the weight and wall states of the node
        copied[event_element.row][event_element.col].weight = 1;
        copied[event_element.row][event_element.col].isWall = false;
      }

      // update with the new grid
      this.setState({
        grid: copied
      });
    };
  }

  /**
   * Handles any mouse clicks anywhere on the grid (at any node).
   * @param {Object} The node obj associated with the clicked div.
   */
  handleClick(key) {
    if (this.state.gridState === "addingWalls") {
      /*  If the user is in "Add Walls" mode, allow the user to paint
       *  individual nodes by clicking on them.
       */
      const copied = this.state.grid.slice();
      copied[key.row][key.col].isWall = true;
      this.setState({ grid: copied });
    } else if (this.state.gridState === "addingWeights") {
      /*  If the user is in "Add Weights" mode, allow the user to paint
       *  individual nodes by clicking on them.
       */
      const copied = this.state.grid.slice();
      copied[key.row][key.col].weight = this.state.weightValue;
      this.setState({ grid: copied });
    } else if (this.state.gridState === "eraseButton") {
      /*  If the user is in "Erase" mode, allow the user to erase
       *  individual nodes by clicking on them.
       */
      const copied = this.state.grid.slice();

      // reset these properties of the node object
      copied[key.row][key.col].weight = 1;
      copied[key.row][key.col].isWall = false;
      this.setState({ grid: copied });
    } else {
      // Else, the user is trying to select a start/end node, or ready to start
      // the search algorithm.
      if (this.state.phase === 1) {
        // set the starting node
        const copied = this.state.grid.slice();
        copied[key.row][key.col].isStart = true;
        this.setState({
          grid: copied,
          start: copied[key.row][key.col],
          // increment to the next phase to add the end node
          phase: 2
        });
      } else if (this.state.phase === 2) {
        // set the end node
        const copied = this.state.grid.slice();
        copied[key.row][key.col].isEnd = true;
        this.setState({
          grid: copied,
          end: copied[key.row][key.col],
          // increment to next phase to start the algo
          phase: 3
        });
      } else {
        // start Dijkstra's Algorithm
        if (!this.state.addingWalls) {
          // create a new Graph instance
          const graph = new Graph();

          // read the current grid into the graph
          graph.gridtoGraph(this.state.grid);

          // find the shortest path
          const result = graph.shortestPath(this.state.start, this.state.end);

          if (!result[0].length) {
            // if there was no result found, create a promise to wait for the
            // searching animation to complete
            const noPath = new Promise((resolve, reject) => {
              resolve(this.animate(result));
              reject("error");
            });

            // After the searching animation is done, increment the phase
            // reflect that no result was found.
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

  /**
   * This function resets the entire state of the search grid and algorithm.
   * It is called when the user presses the reset button.
   */
  resetGrid() {
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

    // This function resets the class of the give node (by id) to .Node
    // It is used to un-color colored nodes.
    function resetNodeClass(value) {
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

  /** This is the main animation function.
   *  It animates both the search path and result path found by Dijkstra's
   *  Algo.
   *
   *  @param {Array<number[]>} an array where idx=0 is the search path and
   *  idx=1 is the result path.
   *  @return {undefined} this function does not return a value
   */
  animate(result) {
    const search_path = result[1];
    const result_path = result[0];

    // function wait is a promise wrapper for setTimeout.
    // it has the same functionality as setTimeout, but also returns a promise.
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    // Array to store promises returned from animating the
    // search path
    const promise_array = [];

    /** Colors the node specified in the search_path as visited.
     *  @param {number} The current index of the search_path array being
     *  animated.
     */
    function animate_search(idx) {
      var node_div = document.getElementById(search_path[idx]);
      if (node_div.className !== "Start" && node_div.className !== "End") {
        node_div.className = "Visited";
      } else {
      }
    }

    /**
     * Animates the result path that Dijkstra's Algo found.
     */
    function animate_result() {
      // begin iterating through the result path found
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
      // for each node we animate, wrap it in the wait promise wrapper, then
      // push it to an array of promises.
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

    // this.props.element is the Node object of the component
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
    <div className="Options">
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
