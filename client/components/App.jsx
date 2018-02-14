import React from 'react';
import axios from 'axios';

class App extends React.Component {
	constructor(props) {
		super(props)

		axios.defaults.withCredentials = true

		this.state = {
			messages: [],
			message: '',
			name: '',
			enteredName: false,
			isLoggedIn: false
		}
	}

	componentWillMount() {

		axios.get('http://127.0.0.1:3304/home')
		  .then((res) => {
		  	if (res.data.isLoggedIn) {
		  		this.setState({messages: res.data.messages, isLoggedIn: res.data.isLoggedIn, name: res.data.name, enteredName: true})
		  	} else {
		  		this.setState({messages: [], isLoggedIn: false, name: ''})
		  	}
		  })
		  .catch((err) => console.log('you suck....did not get message'))
	}

	updateMessages() {

		axios.get('http://127.0.0.1:3304/getMessages')
		  .then((res) => {
		  	this.setState({messages: res.data})
		  })
		  .catch((err) => console.log('you suck....did not get message'))
	}

	renderMessages() {
		return (
			<div>
			  {
			  	this.state.messages.map( mesg => {
				  	return <p style={{fontSize: "16px"}}> {mesg} </p>
			  	})
				}
			</div>
		)
	}

	sendToServer(e) {
		e.preventDefault()

		axios.post('http://127.0.0.1:3304/postMessage', {message: `${this.state.name}: ${this.state.message}`})
		  .then((res) => {
		  	console.log("message posted", res.data.messages);
				this.updateMessages()
				this.setState({message: ''})
		  })
	}

	setName(e) {
		e.preventDefault()
		e.persist()

		if (e.target.name.value !== '') {

			axios.post('http://127.0.0.1:3304/logIn', {name: e.target.name.value})
			  .then((res) => {
			    this.setState({enteredName: true, name: e.target.name.value, messages: res.data.messages})
			  })

		} else {
			alert("Can't be anonymous....NOT TAADAAAYYY")
		}
	}

	setMessage(e) {
		e.preventDefault()
		this.setState({message: e.target.value})
	}

	render() {
		return (
			<div>
			{!this.state.enteredName ?
			  <form onSubmit={this.setName.bind(this)}>
				  <input type="text" placeholder="enter session name" name="name"/>
				  <button> Submit </button>
			  </form>
			:
				<div style={{fontSize: "30px"}}>
				  <p>Logged in as: {this.state.name}</p>
				  <form onSubmit={this.sendToServer.bind(this)}>
					  <input onChange={this.setMessage.bind(this)} value={this.state.message} style={{width: "75%"}} type="text" placeholder="enter message here"/>
					  <button> Send </button>
				  </form>
				  {this.renderMessages()}
				</div>
			}
			</div>
		)
	}
}

export default App