// import axios from 'axios';

// const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// /**
//  * Predict loan eligibility using XGBoost ML service
//  */
// export const predictLoanEligibility = async (req, res) => {
//   try {
//     const {
//       Gender,
//       Married,
//       Dependents,
//       Education,
//       Self_Employed,
//       ApplicantIncome,
//       CoapplicantIncome,
//       LoanAmount,
//       Loan_Amount_Term,
//       Credit_History,
//       Property_Area
//     } = req.body;

//     // Required fields validation
//     const requiredFields = [
//       Gender,
//       Married,
//       Dependents,
//       Education,
//       Self_Employed,
//       ApplicantIncome,
//       LoanAmount,
//       Credit_History,
//       Property_Area
//     ];

//     if (requiredFields.some(v => v === undefined || v === null)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields for ML prediction'
//       });
//     }

//     // Prepare payload EXACTLY as ML service expects
//     const mlPayload = {
//       Gender: Number(Gender),
//       Married: Number(Married),
//       Dependents: Number(Dependents),
//       Education: Number(Education),
//       Self_Employed: Number(Self_Employed),
//       ApplicantIncome: Number(ApplicantIncome),
//       CoapplicantIncome: Number(CoapplicantIncome || 0),
//       LoanAmount: Number(LoanAmount),
//       Loan_Amount_Term: Number(Loan_Amount_Term || 360),
//       Credit_History: Number(Credit_History),
//       Property_Area: Number(Property_Area)
//     };

//     const response = await axios.post(
//   'http://127.0.0.1:8000/predict', // correct endpoint
//   mlPayload,
//   { timeout: 10000 }
// );


//     // Forward ML response cleanly
//     return res.json({
//       success: true,
//       decision: response.data.approved ? 'APPROVED' : 'REJECTED',
//       probability: response.data.probability,
//       risk_bucket: response.data.risk_bucket
//     });

//   } catch (error) {
//     console.error('ML prediction error:', error.response?.data || error.message);

//     return res.status(503).json({
//       success: false,
//       message: 'ML service unavailable',
//       error: error.response?.data || error.message
//     });
//   }
// };

// /**
//  * ML service health check
//  */
// export const checkMLHealth = async (req, res) => {
//   try {
//     const response = await axios.get(
//       ${http://127.0.0.1:8000/docs}/health,
//       { timeout: 5000 }
//     );

//     res.json({
//       success: true,
//       ml_service: 'operational',
//       details: response.data
//     });

//   } catch (error) {
//     res.status(503).json({
//       success: false,
//       ml_service: 'unavailable',
//       error: error.message
//     });
//   }
// };

// /**
//  * Generic prediction passthrough
//  * (useful for testing)
//  */
// export const genericPredict = async (req, res) => {
//   try {
//     const response = await axios.post(
//       ${ML_SERVICE_URL}/predict,
//       req.body,
//       { timeout: 10000 }
//     );

//     res.json(response.data);

//   } catch (error) {
//     res.status(503).json({
//       success: false,
//       message: 'ML service unavailable',
//       error: error.message
//     });
//   }
// };


import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000/docs';

/**
 * MAIN: Predict loan eligibility using ML service
 */
export const predictLoanEligibility = async (req, res) => {
  try {
    const response = await axios.post(
      $,{ML_SERVICE_URL}/predict,
      req.body,
      { timeout: 10000 }
    );

    return res.json({
      success: true,
      ...response.data
    });

  } catch (error) {
    console.error('ML prediction error:', error.response?.data || error.message);

    return res.status(503).json({
      success: false,
      message: 'ML service unavailable',
      error: error.response?.data || error.message
    });
  }
};

/**
 * ML service health check
 */
export const checkMLHealth = async (req, res) => {
  try {
    const response = await axios.get(
      $,{ML_SERVICE_URL}/health,
      { timeout: 5000 }
    );

    return res.json({
      success: true,
      ml_service: 'operational',
      details: response.data
    });

  } catch (error) {
    console.error('ML health check error:', error.message);

    return res.status(503).json({
      success: false,
      ml_service: 'unavailable',
      error: error.message
    });
  }
};

/**
 * Generic prediction passthrough (debug/testing)
 */
export const genericPredict = async (req, res) => {
  try {
    const response = await axios.post(
      $,{ML_SERVICE_URL}/predict,
      req.body,
      { timeout: 10000 }
    );

    return res.json(response.data);

  } catch (error) {
    console.error('Generic prediction error:', error.message);

    return res.status(503).json({
      success: false,
      message: 'ML service unavailable',
      error: error.message
    });
  }
};
