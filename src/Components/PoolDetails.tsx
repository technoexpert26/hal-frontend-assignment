import { gql, useQuery } from "@apollo/client";
import { Key, useEffect, useState } from "react";
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
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { numberFormatter } from "../utils/numberFormatter";
import { timestampToMins } from "../utils/timestampToMins";
import { NavigateFunction, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import loader from "../assets/images/loading.gif";

const PoolDetails = () => {
	interface TablePaginationActionsProps {
		count: number;
		page: number;
		rowsPerPage: number;
		onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
	} // types for pagination props that are being handled by MUI

	interface PoolDetail {
		__typename: string;
		amountUSD: string;
		transaction: {
			id: string;
		};
		timestamp: number;
	} // types for pool details coming from API

	interface LocationState {
		token0: {
			symbol: string;
		};
		token1: {
			symbol: string;
		};
		txCount: string;
	} // types for state coming from useLocation

	const { id } = useParams();
	// get params from url for transaction ID

	const POOL_DETAIL_QUERY = gql`
		query transactions($address: Bytes!) {
			mints(
				first: 100
				orderBy: timestamp
				orderDirection: desc
				where: { pool: $address }
				subgraphError: allow
			) {
				timestamp
				transaction {
					id
					__typename
				}
				pool {
					token0 {
						id
						symbol
						__typename
					}
					token1 {
						id
						symbol
						__typename
					}
					__typename
				}
				owner
				sender
				origin
				amount0
				amount1
				amountUSD
				__typename
			}
			swaps(
				first: 100
				orderBy: timestamp
				orderDirection: desc
				where: { pool: $address }
				subgraphError: allow
			) {
				timestamp
				transaction {
					id
					__typename
				}
				pool {
					token0 {
						id
						symbol
						__typename
					}
					token1 {
						id
						symbol
						__typename
					}
					__typename
				}
				origin
				amount0
				amount1
				amountUSD
				__typename
			}
			burns(
				first: 100
				orderBy: timestamp
				orderDirection: desc
				where: { pool: $address }
				subgraphError: allow
			) {
				timestamp
				transaction {
					id
					__typename
				}
				pool {
					token0 {
						id
						symbol
						__typename
					}
					token1 {
						id
						symbol
						__typename
					}
					__typename
				}
				owner
				amount0
				amount1
				amountUSD
				__typename
			}
		}
	`;

	const { data, loading, error } = useQuery(POOL_DETAIL_QUERY, {
		variables: {
			address: id,
		},
	});

	const [selectedTxType, setSelectedTxType] = useState("swaps");
	const [displayData, setDisplayData] = useState<any[]>([]);
	const navigate: NavigateFunction = useNavigate();

	const location = useLocation();
	const state = location?.state as LocationState;

	const handleTxTypeChange = (val: string) => {
		setSelectedTxType(val);
		if (val === "all") {
			let temp: any[] = [];
			Object.keys(data)?.map((e: string) => {
				return (temp = [...temp, ...data[e]]);
			});
			setDisplayData(temp);
		} else {
			return setDisplayData(data[val]);
		}
		// sets transaction type based on selected option
	};

	const handleAddToWatchlist = () => {
		const getLocalItem: any[] = JSON.parse(
			(localStorage.getItem("poolWatchlist") as string) || "[]",
		);
		if (getLocalItem?.length > 0) {
			localStorage.setItem("poolWatchlist", JSON.stringify([...getLocalItem, state]));
			toast.success("Added to watchlist successfully");
		} else {
			localStorage.setItem("poolWatchlist", JSON.stringify([state]));
			toast.success("Added to watchlist successfully");
		}

		// handles add to watchlist
	};

	useEffect(() => {
		setDisplayData(data?.swaps);
	}, [data]);
	// to set initial state after API call when component mounts

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

	const [page, setPage] = useState(0);
	const rowsPerPage = 10;

	const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - displayData?.length) : 0;

	const handleChangePage = (
		event: React.MouseEvent<HTMLButtonElement> | null,
		newPage: number,
	) => {
		setPage(newPage);
	}; // handles page content when page changes

	if (loading)
		return (
			<div className="h-[100vh] flex justify-center items-center">
				<img className="w-[25%]" src={loader} alt="Loading..." />
			</div>
		);
	if (error) return <span>{toast.error(error.message)}</span>;

	return (
		<Container sx={{ paddingBottom: "50px" }}>
			<div className="mt-5">
				<p
					onClick={() => navigate(-1)}
					className="flex items-center text-[#4E93EF] cursor-pointer">
					<KeyboardArrowLeft />
					<span>Back to Pools</span>
				</p>
				<div className="flex justify-between my-5">
					<h1 className="text-3xl">
						{state && `${state.token0.symbol}/${state.token1.symbol}`}
					</h1>
					<button
						className="bg-[#2F80ED] px-8 rounded-lg text-white flex items-center py-0 leading-[0]"
						onClick={handleAddToWatchlist}>
						<i className="fa-solid fa-star"></i> Add to Watchlist
					</button>
				</div>
				<div className="w-[300px] pt-3 pl-3 pr-[18px] pb-10 rounded-lg border border-black border-b-2 flex justify-between">
					<div>
						<h1 className="font-semibold">Tokens value (USD)</h1>
						<ul>
							<li>
								<i className="fa-brands fa-ethereum text-[#7D7D7D] text-xl"></i>
								{state.token0.symbol}
							</li>
							<li>
								<i className="fa-brands fa-ethereum text-[#7D7D7D] text-xl"></i>
								{state.token1.symbol}
							</li>
						</ul>
					</div>
					<div>
						<h1 className="font-semibold">TX Count</h1>
						<p>{state.txCount}</p>
					</div>
				</div>
			</div>
			<div className="flex">
				<h1 className="mt-10 font-mono text-3xl font-medium text-center">Transactions</h1>
				<select className="p-0 ml-5 w-[100px] mt-10 capitalize bg-transparent border border-black cursor-pointer">
					<option
						onClick={() => handleTxTypeChange("swaps")}
						className="text-black"
						value="swaps"
						defaultChecked>
						Swaps
					</option>
					<option
						className="text-black"
						onClick={() => handleTxTypeChange("mints")}
						value="mints">
						Mints
					</option>
					<option
						className="text-black"
						onClick={() => handleTxTypeChange("burns")}
						value="burns">
						Burns
					</option>
					<option
						className="text-black"
						onClick={() => handleTxTypeChange("all")}
						value="all">
						All
					</option>
				</select>
			</div>
			<TableContainer>
				<Table aria-label="custom pagination table" className="table">
					<TableHead>
						<TableRow
							sx={{
								"& th": {
									fontWeight: 500,
								},
							}}>
							<TableCell sx={{ fontSize: "22px" }}>Link to Etherscan</TableCell>
							<TableCell sx={{ fontSize: "22px" }} align="center">
								TX Type
							</TableCell>
							<TableCell sx={{ fontSize: "22px" }} align="center">
								Token Amount (USD)
							</TableCell>
							<TableCell sx={{ fontSize: "22px" }} align="center">
								Timestamp
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{(rowsPerPage > 0
							? displayData?.slice(
									page * rowsPerPage,
									page * rowsPerPage + rowsPerPage,
							  )
							: displayData
						)?.map((row: PoolDetail, ind: Key) => (
							<TableRow
								key={ind + row.__typename}
								sx={{
									cursor: "pointer",
									"& td": {
										borderBottomColor: "#191B1F",
									},
								}}>
								<TableCell scope="row">
									<div className="ether-link">
										<a
											className="hover:opacity-80 text-[#4E93EF]"
											href={`https://etherscan.io/tx/${row.transaction.id}`}
											target="_blank"
											rel="noreferrer">
											{`https://etherscan.io/tx/${row.transaction.id}`}
										</a>
									</div>
								</TableCell>
								<TableCell align="center">{row.__typename}</TableCell>
								<TableCell align="center">
									{numberFormatter(row.amountUSD)} USDC
								</TableCell>
								<TableCell align="center">
									{timestampToMins(Number(row.timestamp))} minutes ago
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
									// color: "#ffffff",
								},
							}}>
							<TablePagination
								count={displayData?.length}
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

export default PoolDetails;
