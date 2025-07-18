import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TablePagination } from "@mui/material";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
  } from '@mui/material';


  export const ContratTable:React.FC = () => {
    const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(10);

     return( 
         <TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Client</TableCell>
        <TableCell>Contract Type</TableCell>
        <TableCell>Contract ID</TableCell>
        <TableCell>Amount</TableCell>
        <TableCell>Start</TableCell>
        <TableCell>End</TableCell>
        <TableCell>Status</TableCell>
      </TableRow>
    </TableHead>

    <TableBody>
  <TableRow>
    <TableCell colSpan={7} align="center">
      No contracts found
    </TableCell>
  </TableRow>
</TableBody>
    </Table>

    <TablePagination
        component="div"
        count={0} 
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </TableContainer>

  );

  };
