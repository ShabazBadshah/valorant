import React, { Component } from 'react';

// Externals
import PropTypes from 'prop-types';
import classNames from 'classnames';

// Material helpers
import { withStyles } from '@material-ui/core';

// Material components
import { Grid } from '@material-ui/core';

// Shared layouts
/*Dash import here */
// import { Dashboard as DashboardLayout } from './Dashboard';

// Custom components
import { NameGender, Location } from './components';
import { Button, TextField, Typography } from '@material-ui/core';
import Stepper from 'react-stepper-horizontal';
// Shared components
import {
  Portlet,
  PortletHeader,
  PortletLabel,
  PortletContent,
  PortletFooter,
  Status
} from '../../components';

// Component styles
const styles = theme => ({
  root: {
    padding: theme.spacing(4)
  }
});

class MedicalRecord extends Component {
  state = { tabIndex: 0, activeStep: 0, showStep1: true, showStep2: false, lastStepState: false};

  nextStep = () => {

    this.setState({
      showStep1: false,
      showStep2: true,
      activeStep: this.state.activeStep+1
    })

  }

  back = () => {
    this.setState({
      showStep1: true,
      showStep2: false,
      activeStep: this.state.activeStep-1
    })
  }

  lastStep = () => {
    const { history } = this.props;
    alert("Profile Completed!")
    history.push('/dashboard')
    window.location.reload(false);
  }

  render() {
    const { classes } = this.props;

    return (
        <div className={classes.root}>
          <Grid
            container
            spacing={4}
          >
            {this.state.showStep1 ? <Grid
              item
              lg={4}
              md={6}
              xl={8}
              xs={12}
            >
              <NameGender activeStep={this.state.activeStep} back={this.back} nextStep={this.nextStep}/>
            </Grid> : null}

            {this.state.showStep2 ? <Grid
              item
              lg={4}
              md={6}
              xl={8}
              xs={12}
            >
              <Location activeStep={this.state.activeStep} back={this.back} nextStep={this.lastStep}/>
            </Grid> : null}
          </Grid>
        </div>
    );
  }
}

MedicalRecord.propTypes = {
  classes: PropTypes.object.isRequired
};

let newStyles;
[MedicalRecord, newStyles] = require('../../common/customizers').customizers.customizeComponent('MedicalRecord', MedicalRecord, styles);
export default withStyles(newStyles)(MedicalRecord);