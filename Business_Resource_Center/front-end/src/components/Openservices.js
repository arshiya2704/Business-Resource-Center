import React, {Component} from 'react';
import * as API from '../api/API';
class OpenServices extends Component {

    constructor(props) {
        super(props);

        this.state = {
               openquestions:[]
        };
    }

    componentDidMount(){
        API.getOpenServices()
        .then((data) => {
            this.setState({
                openquestions:data
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

                            {/*{this.state.openquestions.map(ques => (*/}

                            {/*))}*/}

                </div>




            </div>
        );
    }
}

export default OpenServices;
