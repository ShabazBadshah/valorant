import React, { Component } from 'react';

import * as LocalStorageProvider from '../../../../utils/local-storage-provider.js';
import * as RoleTypes from '../../../../data/roles-types.js';

// Externals
import classNames from 'classnames';
import moment from 'moment';
import PerfectScrollbar from 'react-perfect-scrollbar';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

// Material helpers
import { withStyles } from '@material-ui/core';

// Material components
import {
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Modal
} from '@material-ui/core';

// Shared components
import {
  Portlet,
  PortletHeader,
  PortletLabel,
  PortletToolbar,
  PortletContent,
  Status
} from '../../../../components';

import BookAppointment from './components/BookAppointment.jsx';
// Component styles
import styles from './styles';

import { 
  bookAppointment, 
  getAllAppointmentsByAccountId, 
  getAllAppointmentsWithStatus, 
  updateAppointmentStatus 
} from '../../../../services/booking/index.js';

const statusColors = {
  'Completed': 'success',
  'Upcoming': 'info',
  'Awaiting Confirmation': 'warning',
  'Cancelled': 'danger'
};

const appointmentStatuses = {
  'Upcoming': 'Approved',
  'Cancelled': 'Cancelled',
  'Awaiting Confirmation': 'Pending',
};

class AppointmentsTable extends Component {

  state = {
    isLoading: false,
    appointments: [],
    appointmentsTotal: 0,
    openAddBookingModal: false
  };

  componentDidMount() {
    this.setState({ isLoading: true });
    
    const accountRole = LocalStorageProvider.getItem(LocalStorageProvider.LS_KEYS.ACCOUNT_ROLE);


    switch(accountRole) {
      case RoleTypes.ROLE_PATIENT: {
        getAllAppointmentsByAccountId(LocalStorageProvider.getItem(LocalStorageProvider.LS_KEYS.ACCOUNT_ID))
          .then(appointments => {
            this.setState({
              appointments: appointments,
              appointmentsTotal: appointments.length,
              isLoading: false,
              showAppointments: true
            })
          })
          .catch(() => {
            this.setState({
              showAppointments: false,
              isLoading: false
            });
          });
          break;
        }

      case RoleTypes.ROLE_RECEPTIONIST: {
        getAllAppointmentsWithStatus(['Cancelled', 'Awaiting Confirmation', 'Upcoming'])
          .then(appointments => {
            this.setState({
              appointments: appointments,
              appointmentsTotal: appointments.length,
              isLoading: false,
              showAppointments: true
            })
          })
          .catch(() => {
            this.setState({
              showAppointments: false,
              isLoading: false
            });
          });
          break;
        }

      default: {
        this.setState({
          showAppointments: false,
          isLoading: false
        });
        break;
      }
    }

  }

  onChangeAppointmentStatus = (appointmentId, status) => {
    const allAppointments = this.state.appointments;
    for (let i = 0; i < this.state.appointments.length; i++) {
      if (allAppointments[i].appointmentid === appointmentId) {
        updateAppointmentStatus(appointmentId, status)
        .then(() => {
          allAppointments[i].status_appt = status;
          this.setState({ appointments: allAppointments });
        }).catch((errMessage) => {
          console.error(errMessage);
        });
        break;
      }
    }   
  }

  onAppointmentClicked = (appointmentId) => {
    const { history } = this.props;

    if (history) { 
      history.push(`/appointments/${appointmentId}`);
    }
  }

  handleAppointmentAdded = (addedAppointmentInfo) => {

    this.handleClose();

    const appointmentToBook = {
      appt_type: "In Person",
      begins_at: addedAppointmentInfo.appointmentDate,
      ends_at: addedAppointmentInfo.appointmentDate,
      doctorid: 1,
      status_appt: "Awaiting Confirmation"
    }

    bookAppointment(
      LocalStorageProvider.getItem(LocalStorageProvider.LS_KEYS.ACCOUNT_ID), appointmentToBook)
      .then(() => {
        this.setState({ isLoading: true })
        getAllAppointmentsByAccountId(LocalStorageProvider.getItem(LocalStorageProvider.LS_KEYS.ACCOUNT_ID))
          .then(appointments => {
            this.setState({
              appointments: appointments,
              appointmentsTotal: appointments.length,
              openBookingModal: false,
              isLoading: false,
              showAppointments: true,
            })
          })
          .catch(() => {
            this.setState({
              showAppointments: false,
              isLoading: false,
              openBookingModal: false
            });
          });
      })
      .catch((errMessage) => {
        console.error(errMessage);
        this.setState({
          showAppointments: false,
          isLoading: false,
          openBookingModal: false
        });
      })
  }

  handleAppointmentDeleted = (appointmentId) => {
    let { appointments } = this.state;
    // orders.filter(order => )
  }

  handleAppointmentUpdated = () => {
  }

  openBookingModal = () => {
    this.setState({ openAddBookingModal: true });
  }

  handleClose = () => {
    const newState = { ...this.state };
    this.setState({ openAddBookingModal: !newState.openAddBookingModal })
  }

  render() {
    const { classes, className } = this.props;
    const { isLoading, appointments, appointmentsTotal } = this.state;

    const rootClassName = classNames(classes.root, className);
    const showAppointments = !isLoading && appointments.length > 0;

    return (
      <Portlet className={rootClassName}>
          <PortletHeader className={classes.portletHeader} noDivider>
            <PortletLabel
              subtitle={`${appointmentsTotal} in total`}
              title="Your Appointments"
            />
            <PortletToolbar>
              <Button
                className={classes.newEntryButton}
                color="primary"
                onClick={() => this.openBookingModal()}
                size="small"
                variant="outlined"
              >
                Book Appointment
              </Button>
            </PortletToolbar>
          </PortletHeader>
          
        <PerfectScrollbar>
          <PortletContent className={classes.portletContent} noPadding>
            {isLoading && (
              <div className={classes.progressWrapper}>
                <CircularProgress />
              </div>
            )}

            <div>
              <Modal open={this.state.openAddBookingModal}>
                <BookAppointment 
                  mode="add"
                  onAppointmentAdded={this.handleAppointmentAdded}
                  onAppointmentDeleted={this.handleAppointmentDeleted}
                  onAppointmentUpdated={this.handleAppointmentUpdated}
                  onCancel={this.handleClose}
                />
              </Modal>

              {showAppointments && (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Appointment ID</TableCell>
                      <TableCell align="left">Appointment Date</TableCell>
                      <TableCell align="left">Time</TableCell>
                      <TableCell align="left">Location</TableCell>
                      <TableCell align="left">Status</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {appointments.map(({ 
                      appointmentid: appointmentId,
                      begins_at: appointmentDateUnixTimestamp, 
                      status_appt: appointmentStatus, 
                      appt_type: appointmentLocation,
                    }) => (
                      (appointmentStatus !== 'Completed' && localStorage.getItem("accountRole") !== 'doctor') &&
                      <TableRow
                        className={classes.tableRow}
                        hover
                        key={appointmentId}
                      >
                        <TableCell onClick={() => this.onAppointmentClicked(appointmentId)}>
                          {`APPT-${appointmentId}`}
                        </TableCell>
                        <TableCell>
                          {moment.unix(appointmentDateUnixTimestamp / 1000).format('DD/MM/YYYY')}
                        </TableCell>
                        <TableCell>{moment.unix(appointmentDateUnixTimestamp / 1000).format("hh:mm A")}</TableCell>
                        <TableCell>{appointmentLocation}</TableCell>

                        { LocalStorageProvider.getItem(LocalStorageProvider.LS_KEYS.ACCOUNT_ROLE) === RoleTypes.ROLE_RECEPTIONIST ? 
                          (
                            <TableCell>
                              <TextField
                                SelectProps={{ native: true }}
                                className={classes.statusField}
                                margin="dense"
                                onChange={(e) => this.onChangeAppointmentStatus(appointmentId, e.target.value)}
                                select
                                value={appointmentStatus}
                                variant="outlined"
                              >
                                {Object.keys(appointmentStatuses).map(status => (
                                  <option key={status} value={status}>
                                    {appointmentStatuses[status]}
                                  </option>
                                ))}
                              </TextField>
                            </TableCell>
                            ):(
                              <TableCell>
                              <div className={classes.statusWrapper}>
                                <Status
                                  className={classes.status}
                                  color={statusColors[appointmentStatus]}
                                  size="sm"
                                />
                                {appointmentStatus}
                              </div>
                            </TableCell>
                          )
                        }
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </PortletContent>
        </PerfectScrollbar>
      </Portlet>
    );
  }
}

AppointmentsTable.propTypes = {
  className: PropTypes.string,
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withStyles(styles)(withRouter(AppointmentsTable));
