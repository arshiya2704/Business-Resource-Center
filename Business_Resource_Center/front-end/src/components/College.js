import React, {Component} from 'react';
import { Route, withRouter } from 'react-router-dom';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import Menu from 'material-ui/svg-icons/navigation/menu';
import RaisedButton from 'material-ui/RaisedButton';
import Openservices from "./Openservices";
import AnsweredServices from "./AnsweredServices";
import UserAnswered from "./UserAnswered";
class College extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            Openservices:false,
            AnsweredServices:false,
            UserAnswered:false
        };
    }
    handleToggle = () => this.setState({open: !this.state.open});
    handleOpen = () => this.setState({
        open: false,
        Openservices:true,
        AnsweredServices:false,
        UserAnswered:false
    });
    handleAnswered = () => this.setState({
        open: false,
        Openservices:false,
        AnsweredServices:true,
        UserAnswered:false
    });
    handleUserAnswered = () => this.setState({
        open: false,
        Openservices:false,
        AnsweredServices:false,
        UserAnswered:true
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
                        <MenuItem onClick={this.handleOpen}>Open Services</MenuItem>
                        <MenuItem onClick={this.handleAnswered}>Closed Services</MenuItem>
                        <MenuItem onClick={this.handleUserAnswered}>My Solutions</MenuItem>
                    </Drawer>
                </div>
                <div className="container-fluid">
                    {
                         this.state.Openservices
                             ?<Openservices />
                             :null
                    }
                    {
                         this.state.AnsweredServices
                             ?<AnsweredServices />
                             :null
                    }
                    {
                        this.state.UserAnswered
                            ?<UserAnswered />
                            :null
                    }
                </div>
            </div>
        );
    }
}

export default withRouter(College);
