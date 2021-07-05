import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import emails from './data/emails.json';

const trash = emails.filter((x) => x.trash === true);
const inbox = emails.filter((x) => x.trash === false || x.trash == undefined);

const useStyles = makeStyles({
  table: {
    minWidth: 300,
  },
});

/**
 * Using https://www.tutorialspoint.com/
 * How-to-calculate-the-difference-between-two-dates-in-JavaScript
 *
 * @param {date} emailDate unformatted email date string
 *
 * @return {object} Formatted date string
 */
function dateOutput(emailDate) {
  const d = new Date(emailDate);
  const today = new Date();
  const timeDiff = today.getTime() - d.getTime();
  const daysDiff = timeDiff / (1000 * 3600 * 24);
  let output = '';
  const arrMonths = [];
  arrMonths[0] = 'Jan';
  arrMonths[1] = 'Feb';
  arrMonths[2] = 'Mar';
  arrMonths[3] = 'Apr';
  arrMonths[4] = 'May';
  arrMonths[5] = 'June';
  arrMonths[6] = 'July';
  arrMonths[7] = 'Aug';
  arrMonths[8] = 'Sept';
  arrMonths[9] = 'Oct';
  arrMonths[10] = 'Nov';
  arrMonths[11] = 'Dec';

  if (daysDiff < 1) {
    if (d.getMinutes() < 10) {
      output = d.getHours() + ':0' + d.getMinutes();
    } else {
      output = d.getHours() + ':' + d.getMinutes();
    }
  } else if (daysDiff >= 1 && daysDiff < 365) {
    output = arrMonths[d.getMonth()] + ' ' + d.getDate();
  } else if (daysDiff >= 365) {
    output = d.getFullYear();
  }

  return output;
}

BasicTable.propTypes = {
  tableMode: PropTypes.string,
};

/**
 * Using https://material-ui.com/components/tables/
 *
 * @return {object} a JSX object
 */
export default function BasicTable({tableMode}) {
  const classes = useStyles();
  let tableContents = inbox;
  if (tableMode == 'Inbox') {
    tableContents = inbox;
  } else if (tableMode == 'Trash') {
    tableContents = trash;
  } else {
    console.log('tableContents error');
  }

  const sortedInbox = tableContents.sort(function(a, b) {
    return new Date(b.received).getTime() - new Date(a.received).getTime();
  });

  return (
    <>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableBody>
            {sortedInbox.map((email) => (
              <TableRow key={email.id} onClick={() => console.log('teast')}>
                <TableCell align="left">{email.from}</TableCell>
                <TableCell align="left">{email.subject}</TableCell>
                <TableCell align="left">{dateOutput(email.received)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
