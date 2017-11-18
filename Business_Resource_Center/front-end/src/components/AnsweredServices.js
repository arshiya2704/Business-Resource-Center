import React, {Component} from 'react';
import * as API from '../api/API';
class AnsweredServices extends Component {

    constructor(props) {
        super(props);

        this.state = {
            Answeredquestions:[]
        };
    }

    componentDidMount(){
        API.getAnsweredServices()
            .then((data) => {
                this.setState({
                    Answeredquestions:data
                });
            });
    }

    componentWillMount(){
        this.setState({

        });
    }
    render() {
        return (
            <div className="container-fluid">
                <h4 className="row justify-content-start pt-3">Search Using any of the following options:</h4>

                <div className="row">

                    {/*{this.state.Answeredquestions.map(ques => (*/}

                    {/*))}*/}

                </div>




            </div>
        );
    }
}

export default AnsweredServices;
