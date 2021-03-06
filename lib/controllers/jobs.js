'use strict';



// Loads the controller
//
// @app   {Object}    The connectjs application instance
//
function main (app) {



  function find (conditions, req, res) {
    app.models.job
    .find(conditions)
    .sort('-priority')
    .exec(function (err, jobs) {
      if (err) {
        res.json(422, err);
      } else {
        res.json(jobs);
      }
    });
  }



  function alter (action, message, req, res) {
    app.models.job[action](req.params.id, function (err, job) {
      if (err) {
        res.json(422, err);
      } else {
        if (job) {
          res.json(201, job);
        } else {
          res.json(404, {message: 'Job not found with id ' + req.params.id + (message || ' and that is available to '+ action)});
        }
      }
    });

  }



  function transform (action, message, req, res) {
    var metadata = {};
    if (req.body.job && req.body.job.metadata) {
      metadata = req.body.job.metadata;
    }
    app.models.job[action](req.params.id, metadata, function (err, job){
      if (err) {
        res.json(422, err);
      } else {
        if (job) {
          res.json(201, job);
        } else {
          res.json(404, {message: 'Job not found with id ' + req.params.id + message});
        }
      }
    });
  }



  return {


    // GET /jobs
    //
    index: function (req,res) {
      find({}, req, res);
    },

    // POST /jobs
    //
    create: function (req,res) {
      var job = new app.models.job(req.body.job);
      job.save(function (err) {
        if (err) {
          res.json(422, err);
        } else {
          res.json(201, job);
        }
      });
    },



    // GET /jobs/search
    //
    search: function (req,res) {
      find(req.query, req, res);
    },



    // GET /jobs/new
    //
    new: function (req,res) {
      find({status: 'new'}, req, res);
    },



    // GET /jobs/processing
    //
    processing: function (req,res) {
      find({status: 'processing'}, req, res);
    },



    // GET /jobs/completed
    //
    completed: function (req,res) {
      find({status: 'completed'}, req, res);
    },



    // GET /jobs/failed
    //
    failed: function (req,res) {
      find({status: 'failed'}, req, res);
    },



    // GET /jobs/:id
    //
    show: function (req,res) {
      app.models.job
      .findOne({_id: req.params.id})
      .exec(function (err, job) {
        if (err) {
          res.json(422, err);
        } else {
          if (job) {
            res.json(job);
          } else {
            res.json(404, {message: 'Job not found with id ' + req.params.id});
          }
        }
      });
    },



    // PUT /jobs/:id
    //
    update: function (req,res) {
      app.models.job
      .findOneAndUpdate({_id: req.params.id}, req.body.job, {}, function (err, job) {
        if (err) {
          res.json(422, err);
        } else {
          if (job) {
            res.json(201, job);
          } else {
            res.json(404, {message: 'Job not found with id ' + req.params.id});
          }
        }
      });
    },



    // PUT /jobs/:id/take
    //
    take: function (req,res) {
      alter('take', null, req, res);
    },



    // PUT /jobs/:id/release
    //
    release: function (req,res) {
      alter('release', null, req, res);
    },



    // PUT /jobs/:id/complete
    //
    complete: function (req,res) {
      transform('complete', ' and that can be marked as completed', req, res);
    },



    // PUT /jobs/:id/fail
    //
    fail: function (req,res) {
      transform('fail', ' and that can be marked as failed', req, res);
    },



    retry: function (req, res) {
      alter('retry', ' and that can be retried', req, res);
    },



    // DELETE /jobs/:id
    //
    delete: function (req,res) {
      var id = req.params.id;
      app.models.job.findByIdAndRemove(id, {}, function (err) {
        if (err) {
          res.json(422, err);
        } else {
          res.json(200, {id: id});
        }
      });
    }
  };
}



// Exposes the public API
//
module.exports = main;