const { Worker } = require('bullmq');
console.log('CHILD PROCESS CREATE', process.pid);
process.on('message', (message) => {
    process.send('Sucessfully!');
});

const worker = new Worker(
    'myQueueName',
    async (job) => {
        console.log('Processing job:', job.data);
        for (let i = 1; i <= 100; i++) {
            const res = await fetch(`https://jsonplaceholder.typicode.com/todos/${i}`);
            const rs = await res.json();
            console.log(rs);
        }
        await job.updateProgress(100);
        return 'DONE';
    },
    {
        connection: {
            host: 'localhost',
            port: 6379,
        },
    },
);

worker.on('completed', (job, returnvalue) => {
    console.debug(`Completed job with id ${job.id}`, returnvalue);
    parentPort.postMessage('Job processed successfully');
});

worker.on('active', (job) => {
    console.debug(`Completed job with id ${job.id}`);
});
worker.on('error', (failedReason) => {
    console.error(`Job encountered an error`, failedReason);
});
