import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { AccountService } from '../services/accountService';

const router = Router();

const validateCreateAccount = [
  body('account_type').isIn(['checking', 'savings']).withMessage('Account type must be "checking" or "savings"'),
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Account name must be between 2 and 50 characters')
];

router.post('/', authenticateToken, validateCreateAccount, async (req: Request, res: Response) => {
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
    const { account_type, name } = req.body;

    const account = await AccountService.createAccount(userId, { account_type, name });

    res.status(201).json({
      success: true,
      data: { account },
      message: 'Account created successfully'
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
    const accounts = await AccountService.getUserAccounts(userId);

    const accountsWithBalances = await Promise.all(
      accounts.map(async (account) => {
        const currentBalance = await AccountService.calculateAccountBalance(account.id);
        return {
          ...account,
          balance: currentBalance
        };
      })
    );

    res.json({
      success: true,
      data: { accounts: accountsWithBalances },
      message: 'Accounts retrieved successfully'
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
    const accountId = parseInt(req.params.id);

    if (isNaN(accountId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid account ID'
      });
    }

    const account = await AccountService.getAccountWithBalance(accountId, userId);

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }

    res.json({
      success: true,
      data: { account },
      message: 'Account retrieved successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/:id/statement', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const accountId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit as string) || 30;

    if (isNaN(accountId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid account ID'
      });
    }

    const statement = await AccountService.getAccountStatement(accountId, userId, limit);

    res.json({
      success: true,
      data: { 
        account_id: accountId,
        transactions: statement,
        count: statement.length
      },
      message: 'Account statement retrieved successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/:id/balance', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const accountId = parseInt(req.params.id);

    if (isNaN(accountId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid account ID'
      });
    }

    const account = await AccountService.getAccountById(accountId, userId);
    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }

    const balance = await AccountService.calculateAccountBalance(accountId);

    res.json({
      success: true,
      data: { 
        account_id: accountId,
        balance: balance,
        account_name: account.name,
        account_type: account.account_type
      },
      message: 'Account balance retrieved successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router; 