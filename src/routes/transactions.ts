import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { TransactionService } from '../services/transactionService';

const router = Router();

const validateCreateTransaction = [
  body('to_account_id').isInt({ min: 1 }).withMessage('Valid destination account ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('transaction_type').isIn(['transfer', 'deposit', 'withdrawal']).withMessage('Invalid transaction type'),
  body('description').optional().trim().isLength({ max: 200 }).withMessage('Description must be less than 200 characters')
];

router.post('/', authenticateToken, validateCreateTransaction, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userId = req.user.id;
    const { from_account_id, to_account_id, amount, description, transaction_type } = req.body;

    TransactionService.validateTransactionData({
      from_account_id,
      to_account_id,
      amount,
      description,
      transaction_type
    });

    const transaction = await TransactionService.processTransaction(userId, {
      from_account_id,
      to_account_id,
      amount,
      description,
      transaction_type
    });

    res.status(201).json({
      success: true,
      data: { transaction },
      message: 'Transaction processed successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 50;

    const transactions = await TransactionService.getUserTransactions(userId, limit);

    res.json({
      success: true,
      data: { 
        transactions,
        count: transactions.length
      },
      message: 'Transactions retrieved successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const transactionId = parseInt(req.params.id);

    if (isNaN(transactionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction ID'
      });
    }

    const transaction = await TransactionService.getTransactionById(transactionId, userId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: { transaction },
      message: 'Transaction retrieved successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/:id/ledger', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const transactionId = parseInt(req.params.id);

    if (isNaN(transactionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction ID'
      });
    }

    const ledgerEntries = await TransactionService.getTransactionLedgerEntries(transactionId, userId);

    res.json({
      success: true,
      data: { 
        transaction_id: transactionId,
        ledger_entries: ledgerEntries,
        count: ledgerEntries.length
      },
      message: 'Ledger entries retrieved successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/transfer', authenticateToken, [
  body('from_account_id').isInt({ min: 1 }).withMessage('Valid source account ID is required'),
  body('to_account_id').isInt({ min: 1 }).withMessage('Valid destination account ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('description').optional().trim().isLength({ max: 200 }).withMessage('Description must be less than 200 characters')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userId = req.user.id;
    const { from_account_id, to_account_id, amount, description } = req.body;

    const transaction = await TransactionService.processTransaction(userId, {
      from_account_id,
      to_account_id,
      amount,
      description,
      transaction_type: 'transfer'
    });

    res.status(201).json({
      success: true,
      data: { transaction },
      message: 'Transfer completed successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/deposit', authenticateToken, [
  body('to_account_id').isInt({ min: 1 }).withMessage('Valid destination account ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('description').optional().trim().isLength({ max: 200 }).withMessage('Description must be less than 200 characters')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userId = req.user.id;
    const { to_account_id, amount, description } = req.body;

    const transaction = await TransactionService.processTransaction(userId, {
      to_account_id,
      amount,
      description,
      transaction_type: 'deposit'
    });

    res.status(201).json({
      success: true,
      data: { transaction },
      message: 'Deposit completed successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/withdrawal', authenticateToken, [
  body('from_account_id').isInt({ min: 1 }).withMessage('Valid source account ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('description').optional().trim().isLength({ max: 200 }).withMessage('Description must be less than 200 characters')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userId = req.user.id;
    const { from_account_id, amount, description } = req.body;

    const transaction = await TransactionService.processTransaction(userId, {
      from_account_id,
      to_account_id: from_account_id,
      amount,
      description,
      transaction_type: 'withdrawal'
    });

    res.status(201).json({
      success: true,
      data: { transaction },
      message: 'Withdrawal completed successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router; 