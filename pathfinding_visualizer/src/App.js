import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';

class Grid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      grid: [],
    }
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
    console.log(copygrid);
    this.setState({
      grid: copygrid,
    });
  }

  render() {
    return(
      <div>
        <h1>Hello</h1>
      </div>
    )
  }
}



export default Grid;
