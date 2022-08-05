import { Routes, Route, Navigate } from "react-router-dom";
import { PoolDetails, Pools } from "./Components";

const Router = () => {
	return (
		<div>
			<Routes>
				<Route path="/" element={<Navigate to="/pools" />} />
				<Route path="/pools" element={<Pools />} />
				<Route path="/pools/:id" element={<PoolDetails />} />
			</Routes>
		</div>
	);
};

export default Router;
