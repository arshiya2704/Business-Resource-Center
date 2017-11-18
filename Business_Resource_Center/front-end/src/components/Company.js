import React, {Component} from 'react';
import { Route, withRouter } from 'react-router-dom';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import Menu from 'material-ui/svg-icons/navigation/menu';
import RaisedButton from 'material-ui/RaisedButton';
import  RequestService from "./RequestService";
import Previousrequests from "./Previousrequests";
class Company extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            RequestService:false,
            Previousrequests:false,

        };
    }
    handleToggle = () => this.setState({open: !this.state.open});
    handleRequestService = () => this.setState({
        open: false,
        RequestService:true,
        Previousrequests:false,

    });
    handlePreviousrequests = () => this.setState({
        open: false,
        RequestService:false,
        Previousrequests:true,

    });



    render() {
        return (
            <div>
                <div className="row mr-5 col-md-10 justify-content-md-start">
                    <Menu
                        onClick={this.handleToggle}
                        viewBox="0 0 20 20"
                    />
                    <Drawer
                        docked={true}
                        zDepth={4}
                        width={200}
                        open={this.state.open}
                        onRequestChange={(open) => this.setState({open})}
                    >
                        <MenuItem onClick={this.handleRequestService}>Request a Service</MenuItem>
                        <MenuItem onClick={this.handlePreviousrequests}>Past Requests</MenuItem>

                    </Drawer>
                </div>
                <div className="container-fluid">
                    {
                        this.state.RequestService
                            ?<RequestService />
                            :null
                    }
                    {
                        this.state.Previousrequests
                            ?<Previousrequests />
                            :null
                    }

                </div>
            </div>
        );
    }
}

export default withRouter(Company);
