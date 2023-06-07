FROM public.ecr.aws/automattic/gb-mobile-image as gutenberg-test-runner

WORKDIR /app

ENTRYPOINT ["/bin/bash", "--login", "-c"]

RUN echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
