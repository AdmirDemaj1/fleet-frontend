import React, {useEffect, useState }from "react";
import { useNavigate }from 'react-router-dom';
import {
    Box,
    Button,
    Typography,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { Add, Search }  from '@mui/icons-material';
import { ContratTable } from "../components/ContratTable";

export const ContractsPage: React.FC = () => {
    const navigate = useNavigate();


    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState< ''>('');

    
  return (
    <Box>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4">Contracts</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate("/contracts/new")}
        >
          Add Contract
        </Button>
      </Box>
  
      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <TextField
          placeholder="Search contracts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
          sx={{ flexGrow: 1, maxWidth: 400 }}
        />
  
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Contract Type</InputLabel>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "")}
            label="Contract Type"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Qira">Qiradhënie</MenuItem>
            <MenuItem value="Hua">hua</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <ContratTable/>
  
      
      
    </Box>
  );
}



