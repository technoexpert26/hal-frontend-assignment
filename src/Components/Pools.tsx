import React, { Key, useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { useTheme } from "@mui/material/styles";
import {
	Box,
	IconButton,
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableContainer,
	TablePagination,
	TableRow,
	Container,
} from "@mui/material";
import { KeyboardArrowRight, KeyboardArrowLeft } from "@mui/icons-material";
import { Path, useNavigate } from "react-router-dom";
import { numberFormatter } from "../utils/numberFormatter";
import loader from "../assets/images/loading.gif";

const Pools = () => {
	interface TablePaginationActionsProps {
		count: number;
		page: number;
		rowsPerPage: number;
		onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
	} // types for pagination props that are being handled by MUI

	interface RecordType {
		id: Partial<Path>;
		token0: {
			symbol: String;
		};
		token1: {
			symbol: String;
		};
		txCount: String;
		totalValueLockedUSD: String;
		volumeUSD: String;
	} // types for data coming from API

	const GET_POOLS = gql`
		{
			pools(orderBy: totalValueLockedUSD, orderDirection: desc, subgraphError: allow) {
				id
				feeTier
				liquidity
				sqrtPrice
				tick
				token0 {
					id
					symbol
					name
					decimals
					derivedETH
					__typename
				}
				token1 {
					id
					symbol
					name
					decimals
					derivedETH
					__typename
				}
				token0Price
				token1Price
				volumeUSD
				txCount
				totalValueLockedToken0
				totalValueLockedToken1
				totalValueLockedUSD
				__typename
			}
		}
	`;
	const poolQuery = useQuery(GET_POOLS, {
		nextFetchPolicy: "cache-first",
	});
	const [page, setPage] = useState(0);
	const navigate = useNavigate();
	const rowsPerPage = 10;

	const { data, loading, error } = poolQuery;

	const TablePaginationActions = (props: TablePaginationActionsProps) => {
		const theme = useTheme();
		const { count, page, rowsPerPage, onPageChange } = props;

		const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
			onPageChange(event, page - 1);
		};

		const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
			onPageChange(event, page + 1);
		};

		return (
			<Box sx={{ flexShrink: 0, ml: 2.5 }}>
				<IconButton
					onClick={handleBackButtonClick}
					disabled={page === 0}
					aria-label="previous page">
					{theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
				</IconButton>
				<IconButton
					onClick={handleNextButtonClick}
					disabled={page >= Math.ceil(count / rowsPerPage) - 1}
					aria-label="next page">
					{theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
				</IconButton>
			</Box>
		);
	}; // MUI function to handle pagination functionality

	const rows = data?.pools;
	console.log("rows", rows);

	const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

	const handleChangePage = (
		event: React.MouseEvent<HTMLButtonElement> | null,
		newPage: number,
	) => {
		setPage(newPage);
	};

	const poolWatchlist: any[] = JSON.parse(localStorage.getItem("poolWatchlist") || "[]");

	if (loading)
		return (
			<div className="h-[100vh] flex justify-center items-center">
				<img className="w-[25%]" src={loader} alt="Loading..." />
			</div>
		);
	if (error) return <pre>{error.message}</pre>;

	return (
		<Container sx={{ paddingBottom: "50px" }}>
			{poolWatchlist.length > 0 && (
				<div>
					<h1 className="mt-10 font-mono text-3xl font-medium">Pools Watchlist</h1>
					<TableContainer>
						<Table aria-label="custom pagination table" className="table">
							<TableHead>
								<TableRow
									sx={{
										"& th": {
											fontWeight: 500,
										},
									}}>
									<TableCell sx={{ fontSize: "18px" }}>Pool</TableCell>
									<TableCell sx={{ fontSize: "18px" }} align="right">
										TX Count
									</TableCell>
									<TableCell sx={{ fontSize: "18px" }} align="right">
										TVL (USD)
									</TableCell>
									<TableCell sx={{ fontSize: "18px" }} align="right">
										Volume (USD)
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{(rowsPerPage > 0
									? poolWatchlist.slice(
											page * rowsPerPage,
											page * rowsPerPage + rowsPerPage,
									  ) // slice table according to number of pages to be shown
									: poolWatchlist
								).map((row: RecordType, ind: Key) => (
									<TableRow
										key={ind}
										onClick={() => navigate(`/pools/${row.id}`, { state: row })}
										sx={{
											cursor: "pointer",
											"& td": {
												borderBottomColor: "#191B1F",
											},
										}}>
										<TableCell>
											<strong>
												<i className="fa-brands fa-ethereum text-[#7D7D7D] text-xl"></i>
												<i className="fa-brands fa-ethereum text-[#7D7D7D] text-xl"></i>
												<span className="ml-2">
													{row.token0.symbol}/{row.token1.symbol}
												</span>
											</strong>
										</TableCell>
										<TableCell width={200} align="right">
											{row.txCount}
										</TableCell>
										<TableCell width={200} align="right">
											${numberFormatter(row.totalValueLockedUSD)}
										</TableCell>
										<TableCell width={200} align="right">
											${numberFormatter(row.volumeUSD)}
										</TableCell>
									</TableRow>
								))}
								{emptyRows > 0 && (
									<TableRow style={{ height: 53 * emptyRows }}>
										<TableCell colSpan={6} />
									</TableRow>
								)}
							</TableBody>
							<TableFooter>
								<TableRow
									sx={{
										"& td": {
											borderBottom: "none",
										},
									}}>
									<TablePagination
										count={poolWatchlist.length}
										rowsPerPage={10}
										page={page}
										onPageChange={handleChangePage}
										ActionsComponent={TablePaginationActions}
									/>
								</TableRow>
							</TableFooter>
						</Table>
					</TableContainer>
				</div>
			)}

			<h1 className="mt-10 font-mono text-3xl font-medium">All Pools</h1>
			<TableContainer>
				<Table aria-label="custom pagination table" className="table">
					<TableHead>
						<TableRow
							sx={{
								"& th": {
									fontWeight: 500,
								},
							}}>
							<TableCell sx={{ fontSize: "18px" }}>Pool</TableCell>
							<TableCell sx={{ fontSize: "18px" }} align="right">
								TX Count
							</TableCell>
							<TableCell sx={{ fontSize: "18px" }} align="right">
								TVL (USD)
							</TableCell>
							<TableCell sx={{ fontSize: "18px" }} align="right">
								Volume (USD)
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{(rowsPerPage > 0
							? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
							: rows
						).map((row: RecordType, ind: Key) => (
							<TableRow
								key={ind}
								onClick={() => navigate(`/pools/${row.id}`, { state: row })}
								sx={{
									cursor: "pointer",
									"& td": {
										borderBottomColor: "#191B1F",
									},
								}}>
								<TableCell>
									<strong>
										<i className="fa-brands fa-ethereum text-[#7D7D7D] text-xl"></i>
										<i className="fa-brands fa-ethereum text-[#7D7D7D] text-xl"></i>
										<span className="ml-2">
											{row.token0.symbol}/{row.token1.symbol}
										</span>
									</strong>
								</TableCell>
								<TableCell width={200} align="right">
									{row.txCount}
								</TableCell>
								<TableCell width={200} align="right">
									${numberFormatter(row.totalValueLockedUSD)}
								</TableCell>
								<TableCell width={200} align="right">
									${numberFormatter(row.volumeUSD)}
								</TableCell>
							</TableRow>
						))}
						{emptyRows > 0 && (
							<TableRow style={{ height: 53 * emptyRows }}>
								<TableCell colSpan={6} />
							</TableRow>
						)}
					</TableBody>
					<TableFooter>
						<TableRow
							sx={{
								"& td": {
									borderBottom: "none",
								},
							}}>
							<TablePagination
								count={rows.length}
								rowsPerPage={10}
								page={page}
								onPageChange={handleChangePage}
								ActionsComponent={TablePaginationActions}
							/>
						</TableRow>
					</TableFooter>
				</Table>
			</TableContainer>
		</Container>
	);
};

export default Pools;
