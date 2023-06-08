FROM public.ecr.aws/automattic/gb-mobile-image as gutenberg-test-runner

WORKDIR /app

ENTRYPOINT ["/bin/bash", "--login", "-c"]

# Setup nvm. TODO: This might be already done at the image level
RUN echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc

# Ensure the Node and npm version are the ones expected by Gutenberg
COPY .nvmrc .nvmrc.host
RUN nvm install $(cat .nvmrc.host)
# Notice the old version of npm.
RUN npm install -g npm@6
