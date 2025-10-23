Component Hooks

this directory defines hooks used by components. They declare reusable functionality that
manages state, handles data transformations, accesses contexts, setp effects etc.

avoid implementing fetch-logic here, that belongs to @/lib/hooks
avoid implementing web3/contract logic here, that belongs to @/lib/web3/hooks

always separate those concerns to make the hooks easy to read and reusable
