# # Builder image
# FROM oven/bun:latest AS builder
# WORKDIR /tmp

# COPY . .
# RUN bun install
# RUN bun build --minify --outfile=index --external @elysiajs/fn --target=node src/index.ts

# # Runtime image, includes Lambda RIC
# FROM public.ecr.aws/lambda/provided:al2

# # Copy our handler code into the task root
# COPY --from=builder /tmp/index ${LAMBDA_TASK_ROOT}
# # Copy bun + runtime.ts into the runtime directory
# COPY --from=builder /tmp/bootstrap ${LAMBDA_RUNTIME_DIR}

# # Set our handler method
# CMD ["index.lambda"]

FROM oven/bun:latest

WORKDIR /app 
COPY . /app 

RUN bun install
RUN bun build --minify --outfile=index.js --external @elysiajs/fn --target=node src/index.ts

CMD ["index.lambda"]