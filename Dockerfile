# TODO: Once stable, this should all go into the base image
#
# Base image at https://github.com/wordpress-mobile/docker-gb-mobile-image
FROM public.ecr.aws/automattic/gb-mobile-image as gutenberg-test-runner

WORKDIR /app

ENTRYPOINT ["/bin/bash", "--login", "-c"]

# Ensure the Node and npm version are the ones expected by Gutenberg
COPY .nvmrc .nvmrc.host
RUN nvm install $(cat .nvmrc.host)
# Notice the old version of npm.
RUN npm install -g npm@6

# Add CI toolkit
#
# Using HTTPS to clone because there's no SSH key in the image
RUN git clone https://github.com/Automattic/a8c-ci-toolkit-buildkite-plugin /ci-toolkit
# Add ci-toolkit to the PATH
RUN echo 'export PATH="$PATH:/ci-toolkit/bin"' >> ~/.bashrc

# Install AWS CLI
RUN apt-get update && apt-get install -y unzip
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscli.zip" && \
    unzip awscli.zip && \
    ./aws/install

# Install jq
RUN apt-get update && apt-get install -y jq
