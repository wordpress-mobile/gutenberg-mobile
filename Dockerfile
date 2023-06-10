# Base image at https://github.com/wordpress-mobile/docker-gb-mobile-image
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

# Add CI toolkit
#
# Using HTTPS to clone because there's no SSH key in the image
RUN git clone https://github.com/Automattic/a8c-ci-toolkit-buildkite-plugin ../ci-toolkit
ENV PATH="$PATH:../ci-toolkit/bin"
