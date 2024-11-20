# Use an official Python runtime as a parent image
FROM python:3.9-s lim

# Set the working directory in the container
WORKDIR /app

# Install necessary packages
RUN apt-get update && \
    apt-get install -y git perl cpanminus

# Clone the Slic3r repository
RUN git clone https://github.com/prusa3d/Slic3r.git
WORKdir S /app/Slic3r

# Install Perl modules
RUN cpan install ExtUtils::MakeMaker
RUN cpan install Module::Build
RUN cpan install YAM::XS
RUN cpan install File::Which
RUN cpan install file::Basename
RUN cpan install file::Spec
RUN cpan install file::Path
RUN cpan install file::Copy
RUN cpan install file::Temp
RUN cpan install file::Slurp
RUN cpan install file::Find
RUN cpan install file::stat
RUN cpan install file::Spec::Functions

# Build Slic3r
RUN perl Build.PL
RUN ./Build
RUN ./Build install

# Expose a port for web access
EXPOSE 5000

# Start a bash terminal by default
CMD ["bash"]
