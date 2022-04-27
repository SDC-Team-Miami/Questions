/* eslint-disable no-console */
import { Router, Request, Response } from 'express';
import {
  getAnswers,
  getQuestions,
  incrementAnswerHelpfulness,
  incrementQuestionHelpfulness,
  postAnswer,
  postQuestion,
  reportAnswer,
  reportQuestion,
} from './db';

const router = Router();

type GetQuestionQueryParams = {
  count: number;
  page: number;
  product_id: number;
};

type PostQuestionParams = {
  body: string;
  email: string;
  name: string;
  product_id: number;
};

type Photo = {
  id: number;
  url: string;
};

type PostAnswerParams = {
  body: string;
  email: string;
  name: string;
  photos: Photo[];
};

// get questions
router.get(
  '/qa/questions',
  async (req: Request<{ question_id: number }, {}, {}, GetQuestionQueryParams>, res: Response) => {
    try {
      const results = await getQuestions(req.query);
      res.status(200).send(results);
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
      } else {
        console.log('Unexpected error', err);
      }
    }
  },
);

// get answers
router.get(
  '/qa/questions/:question_id/answers',
  async (
    req: Request<{ question_id: number }, {}, {}, { count: number; page: number }>,
    res: Response,
  ) => {
    try {
      const results = await getAnswers(req.params, req.query);
      if (typeof results === 'object' && results !== null) {
        res.status(200).send(results);
      }
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
      } else {
        console.log('Unexpected error', err);
      }
    }
  },
);

// post questions
router.post('/qa/questions', async (req: Request<{}, {}, {}, PostQuestionParams>, res: Response) => {
  try {
    await postQuestion(req.query);
    res.status(201).send();
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
      res.status(409).send();
    } else {
      console.log('Unexpected error', err);
      res.status(409).send();
    }
  }
});

// post answers
router.post(
  '/qa/questions/:question_id/answers',
  async (req: Request<{ question_id: number }, {}, {}, PostAnswerParams>, res: Response) => {
    try {
      await postAnswer(req.params.question_id, req.query);
      res.status(201).send();
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
        res.status(409).send();
      } else {
        console.log('Unexpected error', err);
        res.status(409).send();
      }
    }
  },
);

// increment question helpfulness
router.put(
  `/qa/questions/:question_id/helpful`,
  async (req: Request<{ question_id: number }, {}, {}, {}>, res: Response) => {
    try {
      await incrementQuestionHelpfulness(req.params.question_id);
      res.status(204).send();
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
        res.status(409).send();
      } else {
        console.log('Unexpected error', err);
        res.status(409).send();
      }
    }
  },
);

// increment answer helpfulness
router.put(
  `/qa/answers/:answer_id/helpful`,
  async (req: Request<{ answer_id: number }, {}, {}, {}>, res: Response) => {
    try {
      await incrementAnswerHelpfulness(req.params.answer_id);
      res.status(204).send();
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
        res.status(409).send();
      } else {
        console.log('Unexpected error', err);
        res.status(409).send();
      }
    }
  },
);

// report question
router.put(
  '/qa/questions/:question_id/report',
  async (req: Request<{ question_id: number }, {}, {}, {}>, res: Response) => {
    try {
      await reportQuestion(req.params.question_id);
      res.status(204).send();
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
        res.status(409).send();
      } else {
        console.log('Unexpected error', err);
        res.status(409).send();
      }
    }
  },
);

// report answer
router.put(
  '/qa/answers/:answer_id/report',
  async (req: Request<{ answer_id: number }, {}, {}, {}>, res: Response) => {
    try {
      await reportAnswer(req.params.answer_id);
      res.status(204).send();
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
        res.status(409).send();
      } else {
        console.log('Unexpected error', err);
        res.status(409).send();
      }
    }
  },
);

export default router;
