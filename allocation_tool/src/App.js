import React, { useState } from 'react';
import './App.css';

function App() {
    const [allocation, setAllocation] = useState('');
    const [investors, setInvestors] = useState([
        { name: '', requestedAmount: '', allocatedAmount: '' }
    ]);
    // Track if proration has been calculated
    const [isProrated, setIsProrated] = useState(false);

    const handleChange = (index, fieldName, value) => {
        if (fieldName === 'allocation') {
            setAllocation(value);
        } else {
            setInvestors(
                investors.map((investor, i) => {
                    if (i === index) {
                        return { ...investor, [fieldName]: value };
                    }
                    return investor;
                })
            );
        }
    };

    const calculateProration = () => {
        const sumRequestedAmounts = investors.reduce(
            (sum, investor) => sum + Number(investor.requestedAmount),
            0
        );
        let updatedInvestors;

        if (sumRequestedAmounts <= allocation) {
            updatedInvestors = investors.map((investor) => ({
                ...investor,
                allocatedAmount: Number(investor.requestedAmount)
            }));
        } else {
            const totalAverage = investors.reduce(
                (sum, investor) => sum + Number(investor.averageAmount),
                0
            );
            updatedInvestors = investors.map((investor) => ({
                ...investor,
                allocatedAmount: Math.min(
                    allocation *
                        (Number(investor.averageAmount) / totalAverage),
                    investor.requestedAmount
                )
            }));

            let totalAllocated = updatedInvestors.reduce(
                (sum, investor) => sum + investor.allocatedAmount,
                0
            );
            let leftoverAllocation = allocation - totalAllocated;

            while (
                leftoverAllocation > 0 &&
                updatedInvestors.some(
                    (investor) =>
                        investor.allocatedAmount < investor.requestedAmount
                )
            ) {
                for (let i = 0; i < updatedInvestors.length; i++) {
                    if (
                        updatedInvestors[i].allocatedAmount <
                        updatedInvestors[i].requestedAmount
                    ) {
                        let potentialIncrease =
                            updatedInvestors[i].requestedAmount -
                            updatedInvestors[i].allocatedAmount;
                        let proportionalIncrease =
                            (updatedInvestors[i].averageAmount / totalAverage) *
                            leftoverAllocation;
                        let additionalAllocation = Math.min(
                            potentialIncrease,
                            proportionalIncrease
                        );

                        updatedInvestors[i].allocatedAmount +=
                            additionalAllocation;
                        leftoverAllocation -= additionalAllocation;

                        // Break the loop if leftoverAllocation is depleted
                        if (leftoverAllocation <= 0) break;
                    }
                }

                // Recalculate to prevent rounding errors from causing infinite loops
                totalAllocated = updatedInvestors.reduce(
                    (sum, investor) => sum + investor.allocatedAmount,
                    0
                );
                leftoverAllocation = allocation - totalAllocated;
            }
        }

        setInvestors(updatedInvestors);
        setIsProrated(true);
    };

    const addInvestor = () => {
        setInvestors([
            ...investors,
            {
                name: '',
                requestedAmount: '',
                averageAmount: '',
                allocatedAmount: ''
            }
        ]);
    };

    return (
        <div className="container">
            <div className="inputs-section">
                <h2>Inputs</h2>
                <label>Total Available Allocation</label>
                <div className="input-row">
                    <div>
                        <input
                            type="number"
                            value={allocation || ''}
                            onChange={(e) =>
                                handleChange(null, 'allocation', e.target.value)
                            }
                            placeholder="$ Allocation"
                            min="1"
                            required
                        />
                    </div>
                </div>
                <div className="investor-breakdown">
                    <label>Investor Breakdown</label>
                    {investors.map((investor, index) => (
                        <div key={index} className="input-row">
                            <div>
                                <input
                                    type="text"
                                    value={investor.name || ''}
                                    onChange={(e) =>
                                        handleChange(
                                            index,
                                            'name',
                                            e.target.value
                                        )
                                    }
                                    placeholder="Name"
                                />
                            </div>
                            <div>
                                <input
                                    type="number"
                                    value={investor.requestedAmount || ''}
                                    onChange={(e) =>
                                        handleChange(
                                            index,
                                            'requestedAmount',
                                            e.target.value
                                        )
                                    }
                                    placeholder="$ Requested Amount"
                                />
                            </div>
                            <div>
                                <input
                                    type="number"
                                    value={investor.averageAmount || ''}
                                    onChange={(e) =>
                                        handleChange(
                                            index,
                                            'averageAmount',
                                            e.target.value
                                        )
                                    }
                                    placeholder="$ Average Amount"
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="button-group">
                    <button onClick={addInvestor}>+ Investor</button>
                    <button onClick={calculateProration}>Prorate</button>
                </div>
            </div>
            <div className="results-section">
                <h2>Results</h2>
                {isProrated &&
                    investors.map((investor, index) => (
                        <div key={index} className="result-item">
                            {investor.name} - $
                            {typeof investor.allocatedAmount === 'number'
                                ? investor.allocatedAmount
                                : investor.allocatedAmount}
                        </div>
                    ))}
            </div>
        </div>
    );
}

export default App;
