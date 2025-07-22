import React from 'react';
import { TableRow, TableCell, Skeleton } from '@mui/material';

interface VehicleListSkeletonProps {
  rowsPerPage: number;
}

export const VehicleListSkeleton: React.FC<VehicleListSkeletonProps> = ({ rowsPerPage }) => {
  return (
    <>
      {[...Array(rowsPerPage)].map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton animation="wave" width="80%" height={20} />
            <Skeleton animation="wave" width="60%" height={16} />
          </TableCell>
          <TableCell>
            <Skeleton animation="wave" width="90%" height={20} />
          </TableCell>
          <TableCell>
            <Skeleton animation="wave" width={60} height={20} />
          </TableCell>
          <TableCell>
            <Skeleton animation="wave" width={80} height={24} variant="rounded" />
          </TableCell>
          <TableCell>
            <Skeleton animation="wave" width={80} height={20} />
          </TableCell>
          <TableCell>
            <Skeleton animation="wave" width="80%" height={20} />
          </TableCell>
          <TableCell>
            <Skeleton animation="wave" width={120} height={36} />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};