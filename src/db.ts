/* eslint-disable camelcase */
/* eslint-disable no-console */

import { Sequelize, QueryTypes, Op } from 'sequelize';
import 'dotenv/config';
import { DataType } from 'sequelize-typescript';

type GetQuestionQueryParams = {
  count: number;
  page: number;
  product_id: number;
};
type Photo = {
  id: number;
  url: string;
};

type AnswersType = {
  answer_id: string;
  answerer_name: string;
  body: string;
  date: Date;
  helpfulness: number;
  photos: Photo[];
};

type AnswersResults = {
  [key: string]: {
    answer_id?: string;
    answerer_name: string;
    body: string;
    date: Date;
    helpfulness: number;
    id: string;
    photos: Photo[];
  };
};

type PostAnswerParams = {
  body: string;
  email: string;
  name: string;
  photos: Photo[];
};

type RawAnswersType = {
  answer_id: string;
  body: string;
  date: Date;
  answerer_name: string;
  helpfulness: number;
  url: string | null;
  photo_id: number | null;
};
const sequelize = new Sequelize(
  `postgres://${process.env.DBUSER}:${process.env.DBPASSWORD}@${process.env.DBIP}:${process.env.DBPORT}/questiondb`,
);

export const Question = sequelize.define(
  'questions',
  {
    question_id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    product_id: {
      type: DataType.INTEGER,
    },
    question_date: {
      type: DataType.BIGINT,
    },
    question_body: {
      type: DataType.TEXT,
    },
    reported: {
      type: DataType.BOOLEAN,
    },
    asker_name: {
      type: DataType.TEXT,
    },
    asker_email: {
      type: DataType.TEXT,
    },
    question_helpfulness: {
      type: DataType.INTEGER,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  },
);

export const Answer = sequelize.define(
  'answers',
  {
    answer_id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    question_id: {
      type: DataType.INTEGER,
    },
    date: {
      type: DataType.BIGINT,
    },
    body: {
      type: DataType.TEXT,
    },
    reported: {
      type: DataType.BOOLEAN,
    },
    answerer_name: {
      type: DataType.TEXT,
    },
    answerer_email: {
      type: DataType.TEXT,
    },
    helpfulness: {
      type: DataType.INTEGER,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  },
);

type QuestionType = {
  question_id: number;
  question_body: string;
  question_date: string;
  asker_name: string;
  question_helpfulness: number;
  reported: number;
};

export async function connectToDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

export async function getAnswers(
  params: { question_id: number },
  query: { count: number; page: number },
) {
  const { question_id } = params;
  const { count = 5, page = 1 } = query;
  try {
    const queryResults = await sequelize.query(
      `SELECT answers.answer_id, answers.body, answers.date, answers.answerer_name, answers.helpfulness,  answers_photos.url, answers_photos.id as photo_id
      FROM answers
      LEFT JOIN answers_photos ON answers.answer_id = answers_photos.answer_id
      WHERE answers.question_id = ${question_id} LIMIT ${count};`,
      {
        type: QueryTypes.SELECT,
      },
    );
    const allAnswers: AnswersType[] = [];
    console.log(queryResults);
    queryResults.forEach((element: RawAnswersType) => {
      if (!allAnswers.find(answer => answer.answer_id === element.answer_id)) {
        allAnswers.push({
          answer_id: element.answer_id,
          body: element.body,
          date: element.date,
          answerer_name: element.answerer_name,
          helpfulness: element.helpfulness,
          photos: [
            {
              id: element.photo_id,
              url: element.url,
            },
          ],
        });
      } else {
        const i = allAnswers.findIndex(answer => answer.answer_id === element.answer_id);
        if (i !== -1) {
          allAnswers[i].photos.push({
            id: element.photo_id,
            url: element.url,
          });
        }
      }
    });

    const newResults = {
      question: question_id,
      page,
      count,
      results: allAnswers,
    };
    return newResults;
  } catch (error) {
    console.error('error getting answers', error);
    return error;
  }
}

export async function getQuestions(queryParams: GetQuestionQueryParams) {
  const { product_id, count = 5, page = 1 } = queryParams;
  try {
    const queryResults = await sequelize.query(
      `SELECT question_id, question_body, question_date, asker_name, question_helpfulness, reported  FROM questions WHERE product_id = ${product_id};`,
      {
        type: QueryTypes.SELECT,
      },
    );

    const mappedResults = await Promise.all(
      queryResults.map(async (question: QuestionType) => {
        // const questions = {};
        console.log('question: ', question);
        const answers = await getAnswers({ question_id: question.question_id }, { count, page });
        const { results } = answers;
        // console.log(results);
        const answersResults: AnswersResults = {};
        results.forEach((answer: AnswersType) => {
          console.log('answer: ', answer);
          answersResults[answer.answer_id] = { id: answer.answer_id, ...answer };
          delete answersResults[answer.answer_id].answer_id;
        });
        const questionsAndAnswers = { ...question, answers: answersResults };
        return questionsAndAnswers;
      }),
    );
    console.log('mappedResults: ', mappedResults);
    const formattedResults = { product_id, mappedResults };
    return formattedResults;
  } catch (error) {
    console.error('error getting questions', error);
    return error;
  }
}

// TODO auto add date based on current time stamp may not match existing date
export async function postQuestion(PostQuestionParams: {
  body: string;
  email: string;
  name: string;
  product_id: number;
}) {
  const {
    body = 'defaultbody',
    email = 'defaultemail@email.com',
    name = 'defaultname',
    product_id = 1,
  } = PostQuestionParams;
  console.log(body, email, name, product_id);
  try {
    const results = await sequelize.query(
      `INSERT INTO questions (question_body, asker_email, asker_name, product_id)
        VALUES ('${body}', '${email}', '${name}', ${product_id});`,
      {
        type: QueryTypes.INSERT,
      },
    );
    // console.log('db.ts -> postQuestion results: ', results);
    return results;
  } catch (error) {
    console.error('error posting question', error);
    return error;
  }
}

export async function postPhoto(answer_id: number, photo: Photo) {
  try {
    const results = await sequelize.query(
      `INSERT INTO answers_photos (answer_id, url)
        VALUES (${answer_id}, '${photo.url}');`,
      {
        type: QueryTypes.INSERT,
      },
    );
    return results;
  } catch (error) {
    console.error('error posting photo', error);
    return error;
  }
}

// type ResultAnswer = [[{ answer_id: number }], number];

export async function postAnswer(id: number, params: PostAnswerParams) {
  console.log('postAnswer question id: ', id);
  console.log('postAnswer params: ', params);
  const {
    body = 'defaultbody',
    email = 'defaultemail@email.com',
    name = 'defaultname',
    photos = [{ id: 1, url: 'default' }],
  } = params;
  console.log(body, email, name, photos);
  try {
    const resultsAnswer: any = await sequelize.query(
      `INSERT INTO answers (body, answerer_email, answerer_name, question_id)
        VALUES ('${body}', '${email}', '${name}', ${id})
        RETURNING answer_id;`,
      {
        type: QueryTypes.INSERT,
      },
    );
    console.log('resultsAnswer answer_id: ', resultsAnswer); // array with two values [ [{answer_id: number}], 1]
    photos.forEach((photo, index) => {
      console.log('db.ts -> postPhoto -> looping through photos: ', photo, ' ', index);
      postPhoto(resultsAnswer[0][0].answer_id, photo);
    });
    console.log('db.ts -> postQuestion results: ', resultsAnswer);
    return resultsAnswer;
  } catch (error) {
    console.error('error posting question', error);
    return error;
  }
}

export async function incrementAnswerHelpfulness(answer_id: number) {
  try {
    const result = await sequelize.query(
      `UPDATE answers
      SET helpfulness = helpfulness + 1
      WHERE answer_id = ${answer_id};`,
      {
        type: QueryTypes.UPDATE,
      },
    );
    return result;
  } catch (error) {
    console.error('error updating answer helpfulness', error);
    return error;
  }
}

export async function incrementQuestionHelpfulness(question_id: number) {
  try {
    const result = await sequelize.query(
      `UPDATE questions
      SET question_helpfulness = question_helpfulness + 1
      WHERE question_id = ${question_id};`,
      {
        type: QueryTypes.UPDATE,
      },
    );
    return result;
  } catch (error) {
    console.error('error updating question helpfulness', error);
    return error;
  }
}

export async function reportQuestion(question_id: number) {
  try {
    const result = await sequelize.query(
      `UPDATE questions
      SET reported = reported + 1
      WHERE question_id = ${question_id};`,
      {
        type: QueryTypes.UPDATE,
      },
    );
    return result;
  } catch (error) {
    console.error('error reporting question', error);
    return error;
  }
}

export async function reportAnswer(answer_id: number) {
  try {
    const result = await sequelize.query(
      `UPDATE answers
      SET reported = reported + 1
      WHERE answer_id = ${answer_id};`,
      {
        type: QueryTypes.UPDATE,
      },
    );
    return result;
  } catch (error) {
    console.error('error reporting answer', error);
    return error;
  }
}

export const getQuestions2 = async () => {
  try {
    const [results, metadata] = await Question.findAll({
      where: {
        product_id: {
          [Op.eq]: 1,
        },
      },
    });
    console.log('db.ts -> getQuestions results: ', results);
    console.log('db.ts -> getQuestions metadata: ', metadata);
    return results;
  } catch (error) {
    console.error('error getting questions', error);
    return error;
  }
};

export default sequelize;
