# Backend Pagination Fix

To make pagination work properly, you need to modify your backend to return the total count of records.

## Option 1: Return total count in response headers

In your CustomerController, modify the `findAll` method to include the total count in the response headers:

```typescript
@Get()
async findAll(
  @Query('type') type?: CustomerType,
  @Query('search') search?: string,
  @Query('limit') limit?: number,
  @Query('offset') offset?: number,
  @Query('hasVehicles') hasVehicles?: string,
  @Query('hasContracts') hasContracts?: string,
  @Query('hasCollaterals') hasCollaterals?: string,
  @Res() res: Response, // Add Response to set headers
): Promise<void> {
  const result = await this.customerService.findAllWithCount({
    type,
    search,
    limit: limit ? Number(limit) : undefined,
    offset: offset ? Number(offset) : undefined,
    hasVehicles: hasVehicles === 'true',
    hasContracts: hasContracts === 'true',
    hasCollaterals: hasCollaterals === 'true',
  });

  // Set total count in header
  res.setHeader('x-total-count', result.total.toString());
  res.setHeader('Access-Control-Expose-Headers', 'x-total-count');
  
  // Return the data
  res.json(result.data);
}
```

## Option 2: Return paginated response object

Alternatively, you can return an object with both data and total:

```typescript
// In your DTO file, create a paginated response:
export class PaginatedResponseDto<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
}

// Then in your controller:
@Get()
async findAll(
  @Query('type') type?: CustomerType,
  @Query('search') search?: string,
  @Query('limit') limit?: number,
  @Query('offset') offset?: number,
  @Query('hasVehicles') hasVehicles?: string,
  @Query('hasContracts') hasContracts?: string,
  @Query('hasCollaterals') hasCollaterals?: string,
): Promise<PaginatedResponseDto<CustomerResponseDto>> {
  const result = await this.customerService.findAllWithCount({
    type,
    search,
    limit: limit ? Number(limit) : undefined,
    offset: offset ? Number(offset) : undefined,
    hasVehicles: hasVehicles === 'true',
    hasContracts: hasContracts === 'true',
    hasCollaterals: hasCollaterals === 'true',
  });

  return {
    data: result.data,
    total: result.total,
    page: offset && limit ? Math.floor(offset / limit) : 0,
    limit: limit
  };
}
```

## Service Layer Changes

You'll also need to modify your service to return both data and count:

```typescript
// In CustomerService
async findAllWithCount(filters: any): Promise<{ data: CustomerResponseDto[], total: number }> {
  const queryBuilder = this.customerRepository.createQueryBuilder('customer');
  
  // Apply your filters here...
  
  // Get both the data and total count
  const [data, total] = await queryBuilder.getManyAndCount();
  
  return {
    data: data.map(customer => this.mapToResponseDto(customer)),
    total
  };
}
```

Choose Option 1 (headers) for RESTful API standards, or Option 2 (response object) for simpler frontend handling.
